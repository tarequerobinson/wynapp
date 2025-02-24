import { Button, Stack, Text, XStack, YStack, useTheme } from 'tamagui';
import { MoreVertical } from '@tamagui/lucide-icons';
import type { ChatHistoryItem } from '../chat/types';

interface ChatHistoryItemProps {
  chat: ChatHistoryItem;
  theme: ReturnType<typeof useTheme>;
}

export default function ChatHistoryItem({ chat }: ChatHistoryItemProps) {


  const theme = useTheme();

  return (
    <YStack 
      padding="$3"
      backgroundColor="$gray3"
      borderRadius="$2"
      marginBottom="$2"
      pressStyle={{ opacity: 0.8 }}
    >
      <XStack justifyContent="space-between" alignItems="center">
        <YStack>
          <Text 
            color={theme.name === 'dark' ? '$gray12' : '$gray11'}
            fontWeight="500"
          >
            {chat.title}
          </Text>
          <XStack alignItems="center" space="$1">
            <Stack 
              width={8} 
              height={8} 
              borderRadius={4} 
              backgroundColor={chat.id === '1' ? '$green9' : '$gray9'} 
            />
            <Text fontSize="$2" color="$gray9">
              {chat.date.toLocaleDateString()}
            </Text>
          </XStack>
        </YStack>
        <Button 
          size="$2" 
          circular 
          icon={<MoreVertical size={16} />}
        />
      </XStack>
    </YStack>
  );
}