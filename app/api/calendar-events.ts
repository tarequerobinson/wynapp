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
  eventDate: Date; // Only valid event dates, no null
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// In-memory caches
const RAW_CACHE = {
  data: null as string | null,
  timestamp: 0,
  cacheDuration: 15 * 60 * 1000, // 15 minutes for raw RSS
};

const EVENTS_CACHE = {
  data: [] as ExtractedEvent[],
  timestamp: 0,
  cacheDuration: 15 * 60 * 1000, // 15 minutes for parsed events
};

export async function fetchJseEvents(): Promise<ExtractedEvent[]> {
  const now = Date.now();

  if (EVENTS_CACHE.data.length > 0 && now - EVENTS_CACHE.timestamp < EVENTS_CACHE.cacheDuration) {
    console.log('Serving JSE events from cache');
    return EVENTS_CACHE.data;
  }

  try {
    let xmlData: string;

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

    const events = await parseAndCategorizeEvents(rssItems.slice(0, 10));

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
      - Example: If announced in April 2024 with "X will happen on February 28, 2025," the event date is 2025-02-28.
      - Ignore "as at," "posted on," or publication dates (e.g., "${item.pubDate}").
      - If no specific scheduled event date is found, return "null" and the event will be excluded.

      Provide your response in this exact format:
      - Title: [event title]
      - Event Date: [YYYY-MM-DD or null]

      Title: ${item.title}
      Description: ${item.description}
      Published Date (for reference only, do NOT use as event date): ${item.pubDate}
    `;

    let eventDetails: { title: string; eventDate: Date | null } = { title: item.title, eventDate: null };
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.5 },
      });

      const analysis = await result.response.text();
      eventDetails = parseGeminiResponse(analysis);

      // Only include events with a valid eventDate
      if (eventDetails.eventDate) {
        extractedEvents.push({
          title: eventDetails.title,
          eventDate: eventDetails.eventDate,
        });
      }
    } catch (error) {
      console.error('Error analyzing event with Gemini:', error);
      // Skip if Gemini fails
    }
  }

  return extractedEvents;
}

function parseGeminiResponse(response: string): { title: string; eventDate: Date | null } {
  try {
    const titleMatch = response.match(/Title:\s*(.+)$/m);
    const dateMatch = response.match(/Event Date:\s*(.+)$/m);

    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Event';
    const dateStr = dateMatch ? dateMatch[1].trim() : 'null';
    const eventDate = dateStr === 'null' ? null : new Date(dateStr);

    return {
      title,
      eventDate: eventDate && !isNaN(eventDate.getTime()) ? eventDate : null,
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return { title: 'Untitled Event', eventDate: null };
  }
}