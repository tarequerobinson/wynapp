export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    status: 'sending' | 'sent' | 'error';
    type: 'regular' | 'goal' | 'alert' | 'pdf-response' | 'image-response';
    goalData?: {
      title: string;
      target: number;
      timeframe: string;
      description?: string;
    };
    alertData?: {
      type: string;
      target: string;
      condition: string;
      notificationMethod: string[];
    };
  }
  
  export interface QuickPrompt {
    text: string;
    category: string;
    icon: any; // Adjust based on your icon library (e.g., from @tamagui/lucide-icons)
  }
  
  export interface ChatbotUIProps {
    initialMessage?: string;
    botName?: string;
    onConfirmGoal?: (goalData: Message['goalData']) => void;
    onConfirmAlert?: (alertData: Message['alertData']) => void;
  }
  
  export interface ChatHistoryItem {
    id: string;
    title: string;
    date: Date;
  }