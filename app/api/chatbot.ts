import { GoogleGenerativeAI } from '@google/generative-ai';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  type?: 'pdf-upload' | 'regular' | 'pdf-response' | 'goal' | 'alert';
  goalData?: {
    title: string;
    target: number;
    timeframe: string;
    description?: string;
  };
  alertData?: {
    type: 'price' | 'market' | 'news';
    target: string;
    condition: string;
    notificationMethod: string[];
  };
};

type QuickPrompt = {
  text: string;
  category: 'investment' | 'planning' | 'market' | 'retirement' | 'tax' | 'risk';
  icon: any;
};

// Interface for the Chatbot API service
export interface ChatbotApi {
  sendMessage: (prompt: string) => Promise<Message>;
  sendQuickPrompt: (prompt: QuickPrompt) => Promise<Message>;
  uploadAndAnalyzePdf: () => Promise<Message>;
  clearConversation: () => void; // Added to reset conversation history
}

// Initialize Google Generative AI with environment variable
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Store conversation history
let conversationHistory: Array<{ role: "user" | "model"; parts: { text: string }[] }> = [];

const parseResponse = (text: string) => {
  if (text.includes("GOAL:") || (text.includes("financial goal") && text.includes("target"))) {
    try {
      const title = text.match(/title[:=]\s*(.*?)(?:\n|$)/i)?.[1]?.trim() || 
                    text.match(/(?:saving|investment|financial) goal[:\s]+(.*?)(?:\n|$)/i)?.[1]?.trim() ||
                    "Financial Goal";
      const targetMatch = text.match(/(?:target|amount)[:\s]+\$?([\d,]+)/i);
      const target = targetMatch ? parseInt(targetMatch[1].replace(/,/g, '')) : 100000;
      const timeframeMatch = text.match(/(?:timeframe|by|within|in)[:\s]+((?:\d+\s+(?:years?|months?)|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}))/i);
      const timeframe = timeframeMatch ? timeframeMatch[1].trim() : "1 year";
      const descriptionMatch = text.match(/description[:=]\s*(.*?)(?:\n\n|\n(?=[A-Z])|\n$|$)/is);
      const description = descriptionMatch ? descriptionMatch[1].trim() : undefined;

      return {
        type: "goal" as const,
        text,
        goal: { title, target, timeframe, description },
      };
    } catch (error) {
      console.error("Error parsing goal data:", error);
    }
  }
  
  if (text.includes("ALERT:") || text.includes("market alert") || text.includes("price alert")) {
    try {
      const typeMatch = text.match(/(?:alert type|type)[:=]\s*(price|market|news)/i);
      const type = typeMatch ? typeMatch[1].toLowerCase() as 'price' | 'market' | 'news' : "price";
      const targetMatch = text.match(/(?:target|for)[:=]\s*(.*?)(?:\n|when|\s+if)/i);
      const target = targetMatch ? targetMatch[1].trim() : "JSE Index";
      const conditionMatch = text.match(/(?:condition|when|if)[:=]\s*(.*?)(?:\n|notify|$)/i);
      const condition = conditionMatch ? conditionMatch[1].trim() : "changes significantly";
      const notificationMethodMatch = text.match(/(?:notify via|notification method|send)[:=]\s*(.*?)(?:\n|$)/i);
      const notificationMethodText = notificationMethodMatch ? notificationMethodMatch[1].trim() : "email, push";
      const notificationMethod = notificationMethodText
        .split(/[,\s]+/)
        .filter(method => ["email", "sms", "push", "in-app"].includes(method.toLowerCase())) as string[];

      return {
        type: "alert" as const,
        text,
        alert: {
          type,
          target,
          condition,
          notificationMethod: notificationMethod.length ? notificationMethod : ["email", "push"],
        },
      };
    } catch (error) {
      console.error("Error parsing alert data:", error);
    }
  }
  
  return { response: text, status: "success" } as const;
};

// Base prompt with instructions
const basePrompt = `You are DSFG's AI Financial Advisor specialized in Jamaican finance.
      
When answering, always:
1. Focus on the Jamaican financial context
2. Use JMD currency
3. Reference specific Jamaican financial institutions, markets, and regulations
4. Provide actionable advice considering the local economic environment
5. Include relevant local market rates, fees, and costs when applicable
6. Never give an incomplete response
7. Never give a black and white answer for any open ended questions because most things are dependent on the variables relevant to the person asking so ask clarifying questions to get a better idea as to how to respond properly
    
IMPORTANT: If the user is asking about setting up a financial goal, respond with a structured goal response labeled as "GOAL:" including title, target amount, timeframe, and description.
    
IMPORTANT: If the user is asking about setting up a market alert, respond with a structured alert response labeled as "ALERT:" including alert type (price, market, or news), target, condition, and notification method (email, sms, push, in-app).`;

export const chatbotApi: ChatbotApi = {
  sendMessage: async (prompt: string): Promise<Message> => {
    if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) throw new Error("Gemini API key is not configured");

    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    // Add user message to conversation history
    conversationHistory.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    // Prepare the full content with history and base prompt
    const fullContent = [
      { role: "user", parts: [{ text: basePrompt }] },
      ...conversationHistory,
    ];

    const result = await model.generateContent({
      contents: fullContent,
      generationConfig,
    });

    const responseText = result.response.text();
    const parsedResponse = parseResponse(responseText);

    // Add bot response to conversation history
    conversationHistory.push({
      role: "model",
      parts: [{ text: responseText }],
    });

    // Trim conversation history if it gets too long (e.g., keep last 10 exchanges)
    const maxHistoryLength = 20; // 10 exchanges (user + bot)
    if (conversationHistory.length > maxHistoryLength) {
      conversationHistory = conversationHistory.slice(-maxHistoryLength);
    }

    let botMessage: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      timestamp: new Date(),
      status: 'sent',
    };

    if (parsedResponse.type === 'goal') {
      botMessage = {
        ...botMessage,
        text: parsedResponse.text,
        type: 'goal',
        goalData: parsedResponse.goal,
      };
    } else if (parsedResponse.type === 'alert') {
      botMessage = {
        ...botMessage,
        text: parsedResponse.text,
        type: 'alert',
        alertData: parsedResponse.alert,
      };
    } else {
      botMessage = {
        ...botMessage,
        text: parsedResponse.response,
        type: 'regular',
      };
    }

    return botMessage;
  },

  sendQuickPrompt: async (prompt: QuickPrompt): Promise<Message> => {
    if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) throw new Error("Gemini API key is not configured");

    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    // Add quick prompt to conversation history
    conversationHistory.push({
      role: "user",
      parts: [{ text: prompt.text }],
    });

    // Prepare the full content with history and base prompt
    const fullContent = [
      { role: "user", parts: [{ text: basePrompt }] },
      ...conversationHistory,
    ];

    const result = await model.generateContent({
      contents: fullContent,
      generationConfig,
    });

    const responseText = result.response.text();
    const parsedResponse = parseResponse(responseText);

    // Add bot response to conversation history
    conversationHistory.push({
      role: "model",
      parts: [{ text: responseText }],
    });

    // Trim conversation history if it gets too long
    const maxHistoryLength = 20; // 10 exchanges (user + bot)
    if (conversationHistory.length > maxHistoryLength) {
      conversationHistory = conversationHistory.slice(-maxHistoryLength);
    }

    let botMessage: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      timestamp: new Date(),
      status: 'sent',
    };

    if (parsedResponse.type === 'goal') {
      botMessage = {
        ...botMessage,
        text: parsedResponse.text,
        type: 'goal',
        goalData: parsedResponse.goal,
      };
    } else if (parsedResponse.type === 'alert') {
      botMessage = {
        ...botMessage,
        text: parsedResponse.text,
        type: 'alert',
        alertData: parsedResponse.alert,
      };
    } else {
      botMessage = {
        ...botMessage,
        text: parsedResponse.response,
        type: 'regular',
      };
    }

    return botMessage;
  },

  uploadAndAnalyzePdf: async (): Promise<Message> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (result.type === 'cancel') throw new Error('Document selection cancelled');

      const response = await fetch(result.uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');

      const prompt = `Analyze this financial document focusing on Jamaican financial context. Generate:
      
      1. A boolean "isFinanceRelated" indicating if it contains relevant financial content
      2. Main financial "topics" present (list up to 5 key topics)
      3. A "confidence" score between 0-1
      4. A detailed "reason" explaining:
         - Key financial information found
         - Specific topics that can be analyzed
         - Types of questions that can be answered
         - Any Jamaican-specific financial context
      
      Format the response as valid JSON without any code block formatting. Example structure:
      {
        "isFinanceRelated": true,
        "topics": ["topic1", "topic2"],
        "confidence": 0.95,
        "reason": "This document contains... You can ask about..."
      }`;

      // For PDF analysis, include conversation history for context
      const fullContent = [
        { role: "user", parts: [{ text: basePrompt }] },
        ...conversationHistory,
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: "application/pdf",
              },
            },
          ],
        },
      ];

      const resultAnalysis = await model.generateContent(fullContent);

      const analysisText = resultAnalysis.response.text();
      let analysis;
      try {
        const cleanedText = analysisText.replace(/```json\n|\n```/g, "").trim();
        analysis = JSON.parse(cleanedText);
      } catch (e) {
        console.error("Error parsing JSON:", e);
        analysis = {
          isFinanceRelated: false,
          topics: [],
          confidence: 0,
          reason: "Unable to analyze document content. Please ensure it contains financial information.",
        };
      }

      // Add PDF analysis request and response to conversation history
      conversationHistory.push(
        {
          role: "user",
          parts: [{ text: "Uploaded and analyzed a PDF document" }],
        },
        {
          role: "model",
          parts: [{ text: analysisText }],
        }
      );

      // Trim conversation history
      const maxHistoryLength = 20;
      if (conversationHistory.length > maxHistoryLength) {
        conversationHistory = conversationHistory.slice(-maxHistoryLength);
      }

      return {
        id: Date.now().toString(),
        text: analysis.isFinanceRelated 
          ? analysis.reason 
          : "I apologize, but this document doesn't appear to contain financial information. I can only assist with financial documents and related queries.",
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
        type: 'pdf-response',
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      return {
        id: Date.now().toString(),
        text: 'Sorry, I couldn’t process the PDF. Please ensure it’s a valid financial document and try again.',
        sender: 'bot',
        timestamp: new Date(),
        status: 'error',
        type: 'pdf-response',
      };
    }
  },

  clearConversation: () => {
    conversationHistory = [];
  },
};