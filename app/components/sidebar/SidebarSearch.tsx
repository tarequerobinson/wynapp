import { Button, Input, XStack, YStack, useTheme } from 'tamagui';
import { Filter, Search } from '@tamagui/lucide-icons';

interface SidebarSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SidebarSearch({ searchQuery, setSearchQuery }: SidebarSearchProps) {
  const theme = useTheme();
  const isDark = theme.name === 'dark';

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
          backgroundColor={isDark ? '$gray3' : '$gray2'}
          borderWidth={1}
          borderColor="$gray4"
          color="$color"
          icon={<Search size={20} color="$gray9" />}
        />
        <Button 
          icon={<Filter size={20} />}
          backgroundColor={isDark ? '$gray3' : '$gray2'}
          circular
          borderWidth={1}
          borderColor="$gray4"
        />
      </XStack>
      <XStack flexWrap="wrap" gap="$2">
        {['Today', 'This Week', 'Favorites'].map((filter) => (
          <Button
            key={filter}
            size="$2"
            backgroundColor="$gray4"
            borderRadius="$4"
            color="$gray10"
            pressStyle={{ backgroundColor: '$blue5' }}
          >
            {filter}
          </Button>
        ))}
      </XStack>
    </YStack>
  );
}