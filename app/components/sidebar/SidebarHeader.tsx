import { Button, Text, XStack, useTheme } from 'tamagui';
import { ChevronLeft } from '@tamagui/lucide-icons';

interface SidebarHeaderProps {
  title: string;
  onClose: () => void;
  theme: ReturnType<typeof useTheme>;
}

export function SidebarHeader({ title, onClose, theme }: SidebarHeaderProps) {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Text 
        fontSize="$6" 
        fontWeight="bold" 
        color={theme.name === 'dark' ? '$gray12' : '$gray11'}
      >
        {title}
      </Text>
      <Button
        size="$3"
        circular
        icon={<ChevronLeft size={20} />}
        onPress={onClose}
      />
    </XStack>
  );
}