import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// In-memory caches
const SUMMARY_CACHE = new Map<string, string>();
const NEWS_CACHE = {
  data: [] as NewsItem[],
  timestamp: 0,
  cacheDuration: 10 * 60 * 1000, // 10 minutes
};

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

// Function to calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^\w\s]/g, '');
  const s2 = str2.toLowerCase().replace(/[^\w\s]/g, '');
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Function to remove duplicate articles
function removeDuplicates(articles: NewsItem[]): NewsItem[] {
  const uniqueArticles: NewsItem[] = [];
  const seenArticles = new Map<string, Set<string>>();
  const SIMILARITY_THRESHOLD = 0.8;

  for (const article of articles) {
    const source = article.source;
    const title = article.title;
    
    if (!seenArticles.has(source)) {
      seenArticles.set(source, new Set([title]));
      uniqueArticles.push(article);
      continue;
    }

    const sourceArticles = seenArticles.get(source)!;
    let isDuplicate = false;

    for (const seenTitle of sourceArticles) {
      if (calculateSimilarity(title, seenTitle) >= SIMILARITY_THRESHOLD) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      sourceArticles.add(title);
      uniqueArticles.push(article);
    }
  }

  return uniqueArticles;
}

// Function to scrape article details from Gleaner pages using basic string matching
async function scrapeGleanerArticle(link: string): Promise<{ imageUrl?: string; content?: string }> {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html',
    };
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const response = await axios.get(`${proxyUrl}${encodeURIComponent(link)}`, { headers });
    const html = response.data;

    // Extract image URL from og:image meta tag using regex
    let imageUrl: string | undefined;
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
    if (imageMatch && imageMatch[1]) {
      imageUrl = imageMatch[1];
    }

    // Extract content by finding div with class "article-content" and its <p> tags using regex
    let content = '';
    const contentMatch = html.match(/<div class="article-content">([\s\S]*?)<\/div>/i);
    if (contentMatch && contentMatch[1]) {
      const paragraphs = contentMatch[1].match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
      paragraphs.forEach(paragraph => {
        const textMatch = paragraph.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        if (textMatch && textMatch[1]) {
          // Remove any script or style tags and trim whitespace
          const text = textMatch[1].replace(/<script[^>]*>[\s\S]*?<\/script>|<style[^>]*>[\s\S]*?<\/style>/gi, '').trim();
          if (text && !text.includes('newsletter-sign-up')) { // Avoid newsletter content
            content += text + '\n';
          }
        }
      });
    }

    // Clean up the content
    content = content.trim().replace(/\n\s*\n/g, '\n').replace(/^\s+|\s+$/g, '');

    return { imageUrl, content: content || undefined };
  } catch (error) {
    console.error(`Failed to scrape Gleaner article from ${link}:`, error);
    return { imageUrl: undefined, content: undefined };
  }
}

export const newsApi: NewsApi = {
  fetchNews: async (): Promise<NewsItem[]> => {
    const now = Date.now();

    if (NEWS_CACHE.data.length > 0 && now - NEWS_CACHE.timestamp < NEWS_CACHE.cacheDuration) {
      console.log('Serving news from cache');
      return NEWS_CACHE.data;
    }

    try {
      console.log('Fetching fresh news...');
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/xml',
      };

      const primaryProxy = 'https://api.allorigins.win/raw?url=';
      const fallbackProxy = 'https://corsproxy.io/?';
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

      const gleanerItemsPromises = (gleanerJson?.rss?.channel?.item || []).map(async (item: any) => {
        const baseItem = {
          title: item.title || '',
          link: item.link || '',
          pubDate: new Date(item.pubDate || '').toISOString(),
          description: item.description?.trim() || '',
          creator: item['dc:creator'] || '',
          source: 'Gleaner' as const,
          category: item.category ? (Array.isArray(item.category) ? item.category : [item.category]) : [],
        };

        // Scrape Gleaner article for image and full content
        const scrapedData = await scrapeGleanerArticle(item.link);
        return {
          ...baseItem,
          imageUrl: scrapedData.imageUrl || undefined,
          content: scrapedData.content || item.description || '',
        };
      });

      const gleanerItems = await Promise.all(gleanerItemsPromises);

      const allNews = [...gleanerItems, ...observerItems].sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );

      const uniqueNews = removeDuplicates(allNews);

      NEWS_CACHE.data = uniqueNews;
      NEWS_CACHE.timestamp = now;

      return uniqueNews;
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
        return SUMMARY_CACHE.get(cacheKey)!;
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