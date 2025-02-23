import { Button, Input, XStack, YStack, useTheme } from 'tamagui';
import { Filter, Search } from '@tamagui/lucide-icons';

interface SidebarSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: ReturnType<typeof useTheme>;
}

export function SidebarSearch({ searchQuery, setSearchQuery, theme }: SidebarSearchProps) {
  return (
    <YStack space="$2">
      <XStack alignItems="center" space="$2">
        <Input
          flex={1}
          placeholder="Search chats..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          borderRadius="$4"
          padding="$2"
          backgroundColor="$gray3"
          borderWidth={0}
          icon={<Search size={20} color="$gray9" />}
        />
        <Button 
          icon={<Filter size={20} />}
          backgroundColor="$gray3"
          circular
        />
      </XStack>
      <XStack flexWrap="wrap" gap="$2">
        {['Today', 'This Week', 'Favorites'].map((filter) => (
          <Button
            key={filter}
            size="$2"
            backgroundColor="$gray4"
            borderRadius="$4"
            color="$gray11"
            pressStyle={{ backgroundColor: '$blue5' }}
          >
            {filter}
          </Button>
        ))}
      </XStack>
    </YStack>
  );
}