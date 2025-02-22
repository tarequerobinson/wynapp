// app/modal.tsx
import { ChatbotUI } from '../components/chat/Chatbot';
import { useRouter } from 'expo-router';

export default function ChatModal() {
  const router = useRouter();
  return (
    <ChatbotUI 
      onClose={() => router.back()}
      botName="Financial Assistant"
      initialMessage="Welcome to your Financial Assistant!"
    />
  );
}