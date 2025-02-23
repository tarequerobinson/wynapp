import { ScrollView, Text, YStack, useTheme } from 'tamagui';
import ChatHistoryItem from './ChatHistoryItem';

interface ChatHistoryListProps {
  filteredChats: ChatHistoryItem[];
  theme: ReturnType<typeof useTheme>;
}

export function ChatHistoryList({ filteredChats, theme }: ChatHistoryListProps) {
  return (
    <ScrollView flex={1}>
      {filteredChats.map((chat) => (
        <ChatHistoryItem key={chat.id} chat={chat} theme={theme} />
      ))}
      {filteredChats.length === 0 && (
        <Text color="$gray9" textAlign="center" marginTop="$4">
          No chats found
        </Text>
      )}
    </ScrollView>
  );
}