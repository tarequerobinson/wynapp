import { useRouter, useFocusEffect } from 'expo-router';
import { ChatbotUI } from '@/components/chat/Chatbot'; // Adjust the import path to where your ChatbotUI is located
import { YStack, Button } from 'tamagui';
import { BotMessageSquare } from '@tamagui/lucide-icons';

export default function ChatModal() {
  const router = useRouter();

  // Ensure tab bar is hidden when this screen is focused
  useFocusEffect(() => {
    // Hide the tab bar
    // Note: Expo Router doesn't directly expose tab bar hiding, but you can use screenOptions or custom logic
    // For now, rely on the `tabBarStyle: { display: 'none' }` in TabLayout
  });

  return (
    <YStack flex={1} space="$0" padding="$0">
      {/* Changed: Added space="$0" and padding="$0" to remove any default spacing or padding */}
      <ChatbotUI
        initialMessage="Hello! I'm your AI assistant. How can I help you today?"
        botName="AI Assistant"
        onConfirmGoal={(goalData) => console.log('Goal confirmed:', goalData)}
        onConfirmAlert={(alertData) => console.log('Alert confirmed:', alertData)}
      />
    </YStack>
  );
}