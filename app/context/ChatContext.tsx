import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatHistoryItem {
  id: string;
  title: string;
  date: Date;
}

interface ChatContextType {
  chatHistory: ChatHistoryItem[];
  setChatHistory: (history: ChatHistoryItem[] | ((prev: ChatHistoryItem[]) => ChatHistoryItem[])) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { id: '1', title: 'Investment Options', date: new Date('2025-02-20') },
    { id: '2', title: 'Tax Questions', date: new Date('2025-02-19') },
  ]);

  return (
    <ChatContext.Provider value={{ chatHistory, setChatHistory }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};