// app/api/newsApi.ts
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// In-memory caches
const SUMMARY_CACHE = new Map<string, string>();
const NEWS_CACHE = {
  data: [] as NewsItem[],
  timestamp: 0,
  cacheDuration: 10 * 60 * 1000, // 10 minutes
};

// Define NewsItem interface
export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: 'Gleaner' | 'Observer';
  description?: string;
  creator?: string;
  category?: string[];
  content?: string;
  imageUrl?: string;
}

// Define NewsApi interface
export interface NewsApi {
  fetchNews: () => Promise<NewsItem[]>;
  fetchNewsSummary: (newsItems: NewsItem[]) => Promise<string>;
}

// Main news API object
export const newsApi: NewsApi = {
  fetchNews: async (): Promise<NewsItem[]> => {
    const now = Date.now();

    // Serve from cache if valid
    if (NEWS_CACHE.data.length > 0 && now - NEWS_CACHE.timestamp < NEWS_CACHE.cacheDuration) {
      console.log('Serving news from cache');
      return NEWS_CACHE.data;
    }

    try {
      console.log('Fetching fresh news...');
      // Custom headers to mimic a browser request
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/xml',
      };

      // Fetch RSS feeds with fallback proxy
      const primaryProxy = 'https://api.allorigins.win/raw?url=';
      const fallbackProxy = 'https://corsproxy.io/?'; // Alternative proxy
      const gleanerUrl = 'https://jamaica-gleaner.com/feed/business.xml';
      const observerUrl = 'https://www.jamaicaobserver.com/feed';

      let gleanerResponse, observerResponse;

      try {
        [gleanerResponse, observerResponse] = await Promise.all([
          axios.get(`${primaryProxy}${encodeURIComponent(gleanerUrl)}`, { headers }),
          axios.get(`${primaryProxy}${encodeURIComponent(observerUrl)}`, { headers }),
        ]);
      } catch (primaryError) {
        console.warn('Primary proxy failed, trying fallback...', primaryError);
        [gleanerResponse, observerResponse] = await Promise.all([
          axios.get(`${fallbackProxy}${encodeURIComponent(gleanerUrl)}`, { headers }),
          axios.get(`${fallbackProxy}${encodeURIComponent(observerUrl)}`, { headers }),
        ]);
      }

      if (!gleanerResponse?.data || !observerResponse?.data) {
        throw new Error('Failed to fetch news feeds');
      }

      const parser = new XMLParser({
        ignoreAttributes: false,
        parseAttributeValue: true,
      });

      const gleanerJson = parser.parse(gleanerResponse.data);
      const observerJson = parser.parse(observerResponse.data);

      const gleanerItems = gleanerJson?.rss?.channel?.item?.map((item: any) => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: new Date(item.pubDate || '').toISOString(),
        description: item.description?.trim() || '',
        creator: item['dc:creator'] || '',
        source: 'Gleaner' as const,
        category: item.category ? (Array.isArray(item.category) ? item.category : [item.category]) : [],
        imageUrl: item['media:content']?.['@_url'] || item.enclosure?.['@_url'] || undefined,
        content: item['content:encoded'] || item.description || '',
      })) || [];

      const observerItems = observerJson?.rss?.channel?.item?.map((item: any) => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: new Date(item.pubDate || '').toISOString(),
        description: item.description?.trim() || '',
        creator: item['dc:creator'] || '',
        source: 'Observer' as const,
        category: item.category ? (Array.isArray(item.category) ? item.category : [item.category]) : [],
        imageUrl: item['media:content']?.['@_url'] || item.enclosure?.['@_url'] || undefined,
        content: item['content:encoded'] || item.description || '',
      })) || [];

      const allNews = [...gleanerItems, ...observerItems].sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );

      // Update cache
      NEWS_CACHE.data = allNews;
      NEWS_CACHE.timestamp = now;

      return allNews;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch news');
    }
  },

  fetchNewsSummary: async (newsItems: NewsItem[]): Promise<string> => {
    try {
      if (!newsItems.length) {
        return 'No news available to summarize.';
      }

      if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
      }

      const cacheKey = newsItems.slice(0, 50).map(a => `${a.title}|${a.pubDate}`).join('||');

      if (SUMMARY_CACHE.has(cacheKey)) {
        return SUMMARY_CACHE.get(cacheKey);
      }

      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      };

      const prompt = `You are a Jamaica-based, polite personal financial analyst assistant. 
        Your task is to summarize the latest Jamaican business news in one concise paragraph. 
        Use a personal and direct tone by addressing clients as "you" and "we." 
        Provide valuable insights without asking questions, and keep your summary brief to respect your client's time. 
        Highlight impactful information within your financial expertise that could influence their personal finances. 
        If no relevant news is found, inform them that the current business updates do not impact their financial goals. 
        Additionally, analyze how any news might directly or indirectly affect companies listed on the Jamaica Stock Exchange (JSE), 
        whether positively or negatively. Format your response in markdown.

        Analyze these Jamaican business articles, highlight key trends and takeaways, and assess potential impacts on your client's financial well-being:
        ${newsItems.slice(0, 50).map(item => `
          Title: ${item.title}
          Source: ${item.source}
          Date: ${new Date(item.pubDate).toLocaleDateString('en-JM')}
          Description: ${item.description}
          Categories: ${item.category?.join(', ') || 'N/A'}
        `).join('\n\n')}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const summary = result.response.text();
      SUMMARY_CACHE.set(cacheKey, summary);
      setTimeout(() => SUMMARY_CACHE.delete(cacheKey), 3600000); // 1-hour expiration

      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error instanceof Error ? error : new Error('Failed to generate news summary');
    }
  },
};