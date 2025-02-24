import { ScrollView, Text, YStack, useTheme } from 'tamagui';
import ChatHistoryItem from './ChatHistoryItem';
import type { ChatHistoryItem as ChatHistoryItemType } from '@/components/chat/types'; // Renamed type import

interface ChatHistoryListProps {
  filteredChats: ChatHistoryItemType[]; // Use renamed type
}

export function ChatHistoryList({ filteredChats }: ChatHistoryListProps) {
  const theme = useTheme();

  return (
    <ScrollView flex={1}>
      {filteredChats.map((chat) => (
        <ChatHistoryItem key={chat.id} chat={chat} />
      ))}
      {filteredChats.length === 0 && (
        <Text color="$gray9" textAlign="center" marginTop="$4">
          No chats found
        </Text>
      )}
    </ScrollView>
  );
}