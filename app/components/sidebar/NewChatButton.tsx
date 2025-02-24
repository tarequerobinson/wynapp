import { Button, Text, useTheme } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';

interface NewChatButtonProps {
  onPress: () => void;
}

export function NewChatButton({ onPress }: NewChatButtonProps) {
  const theme = useTheme();

  return (
    <Button
      icon={<Plus size={20} />}
      backgroundColor="$blue9"
      color="$white"
      hoverStyle={{ backgroundColor: '$blue10' }}
      onPress={onPress}
    >
      <Text color="$white" fontSize="$4">
        New Chat
      </Text>
    </Button>
  );
}