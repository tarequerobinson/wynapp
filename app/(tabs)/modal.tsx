// app/modal.tsx
import { Chatbot } from '../components/chat/Chatbot';
import { useRouter } from 'expo-router';

export default function ChatModal() {
  const router = useRouter();
  return (
    <Chatbot 
      onClose={() => router.back()}
      botName="Financial Assistant"
      initialMessage="Welcome to your Financial Assistant!"
    />
  );
}