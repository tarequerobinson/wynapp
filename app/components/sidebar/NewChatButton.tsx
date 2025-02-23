import { Button, useTheme } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';

interface NewChatButtonProps {
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}

export function NewChatButton({ onPress, theme }: NewChatButtonProps) {
  return (
    <Button
      icon={<Plus size={20} />}
      backgroundColor="$blue10"
      color="white"
      hoverStyle={{ backgroundColor: '$blue11' }}
      onPress={onPress}
    >
      New Chat
    </Button>
  );
}