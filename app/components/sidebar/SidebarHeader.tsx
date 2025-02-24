import { Button, Text, XStack, useTheme } from 'tamagui';
import { ChevronLeft } from '@tamagui/lucide-icons';

interface SidebarHeaderProps {
  title: string;
  onClose: () => void;
}

export function SidebarHeader({ title, onClose }: SidebarHeaderProps) {
  const theme = useTheme();

  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Text 
        fontSize="$6" 
        fontWeight="bold" 
        color="$color"
      >
        {title}
      </Text>
      <Button
        size="$3"
        circular
        icon={<ChevronLeft size={20} />}
        onPress={onClose}
        backgroundColor="transparent"
        borderWidth={1}
        borderColor="$gray4"
      />
    </XStack>
  );
}