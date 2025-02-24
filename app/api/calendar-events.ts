// app/api/jseEvents.ts
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Type definitions
interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  category: string | string[];
}

export interface ExtractedEvent {
  title: string;
  eventDate: Date;
  type: 'dividend' | 'meeting' | 'financial' | 'corporate' | 'other';
  description: string;
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// In-memory caches with better typing
interface Cache<T> {
  data: T;
  timestamp: number;
  cacheDuration: number;
}

const RAW_CACHE: Cache<string | null> = {
  data: null,
  timestamp: 0,
  cacheDuration: 15 * 60 * 1000, // 15 minutes for raw RSS
};

const EVENTS_CACHE: Cache<ExtractedEvent[]> = {
  data: [],
  timestamp: 0,
  cacheDuration: 15 * 60 * 1000, // 15 minutes for parsed events
};

function determineEventType(title: string, description: string): ExtractedEvent['type'] {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('dividend') || text.includes('distribution')) {
    return 'dividend';
  }
  if (text.includes('meeting') || text.includes('agm') || text.includes('egm')) {
    return 'meeting';
  }
  if (text.includes('financial') || text.includes('results') || text.includes('report')) {
    return 'financial';
  }
  if (text.includes('merger') || text.includes('acquisition') || text.includes('restructuring')) {
    return 'corporate';
  }
  return 'other';
}

export async function fetchJseEvents(): Promise<ExtractedEvent[]> {
  const now = Date.now();

  // Check events cache first
  if (EVENTS_CACHE.data.length > 0 && now - EVENTS_CACHE.timestamp < EVENTS_CACHE.cacheDuration) {
    console.log('Serving JSE events from cache');
    return EVENTS_CACHE.data;
  }

  try {
    let xmlData: string;

    // Check raw cache
    if (RAW_CACHE.data && now - RAW_CACHE.timestamp < RAW_CACHE.cacheDuration) {
      console.log('Using cached RSS data');
      xmlData = RAW_CACHE.data;
    } else {
      console.log('Fetching fresh JSE RSS feed...');
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/xml',
      };

      const primaryProxy = 'https://api.allorigins.win/raw?url=';
      const fallbackProxy = 'https://corsproxy.io/?';
      const jseUrl = 'https://www.jamstockex.com/feed/';

      let response;
      try {
        response = await axios.get(`${primaryProxy}${encodeURIComponent(jseUrl)}`, { headers });
      } catch (primaryError) {
        console.warn('Primary proxy failed, trying fallback...', primaryError);
        response = await axios.get(`${fallbackProxy}${encodeURIComponent(jseUrl)}`, { headers });
      }

      if (!response?.data) {
        throw new Error('Failed to fetch JSE feed');
      }

      xmlData = response.data;
      RAW_CACHE.data = xmlData;
      RAW_CACHE.timestamp = now;
    }

    const parser = new XMLParser({ ignoreAttributes: false, parseAttributeValue: true });
    const jsonObj = parser.parse(xmlData);
    const rssItems = jsonObj.rss.channel.item;

    const events = await parseAndCategorizeEvents(rssItems.slice(0, 20));

    EVENTS_CACHE.data = events;
    EVENTS_CACHE.timestamp = now;

    return events;
  } catch (error) {
    console.error('Error in JSE events API:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching JSE events');
  }
}

async function parseAndCategorizeEvents(items: RssItem[]): Promise<ExtractedEvent[]> {
  const extractedEvents: ExtractedEvent[] = [];

  for (const item of items) {
    const prompt = `
      You are a financial event analyzer for the Jamaica Stock Exchange (JSE).
      Analyze this RSS item to extract:
      1. Event title (e.g., "Future Energy Source Company Limited (FESCO) – Redemption of $700M Bond")
      2. Event date (the specific scheduled date of the event, NOT the publication/announcement date; must be explicitly stated in the title or description; format as YYYY-MM-DD).
      3. Key details (a brief 1-2 sentence summary of the event)
      
      - Example: If announced in April 2024 with "X will happen on February 28, 2025," the event date is 2025-02-28.
      - Ignore "as at," "posted on," or publication dates.
      - If no specific scheduled event date is found, return "null" and the event will be excluded.

      Provide your response in this exact format:
      - Title: [event title]
      - Event Date: [YYYY-MM-DD or null]
      - Details: [brief summary]

      Title: ${item.title}
      Description: ${item.description}
      Published Date (for reference only, do NOT use as event date): ${item.pubDate}
    `;

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.5 },
      });

      const analysis = await result.response.text();
      const parsed = parseGeminiResponse(analysis, item);

      if (parsed.eventDate) {
        extractedEvents.push({
          title: parsed.title,
          eventDate: parsed.eventDate,
          type: determineEventType(parsed.title, item.description),
          description: parsed.description,
        });
      }
    } catch (error) {
      console.error('Error analyzing event with Gemini:', error);
      // Skip if Gemini fails
    }
  }

  return extractedEvents.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
}

function parseGeminiResponse(
  response: string,
  originalItem: RssItem
): { title: string; eventDate: Date | null; description: string } {
  try {
    const titleMatch = response.match(/Title:\s*(.+)$/m);
    const dateMatch = response.match(/Event Date:\s*(.+)$/m);
    const detailsMatch = response.match(/Details:\s*(.+)$/m);

    const title = titleMatch ? titleMatch[1].trim() : originalItem.title;
    const dateStr = dateMatch ? dateMatch[1].trim() : 'null';
    const description = detailsMatch ? detailsMatch[1].trim() : '';
    const eventDate = dateStr === 'null' ? null : new Date(dateStr);

    return {
      title,
      eventDate: eventDate && !isNaN(eventDate.getTime()) ? eventDate : null,
      description,
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return { 
      title: originalItem.title, 
      eventDate: null,
      description: originalItem.description,
    };
  }
}