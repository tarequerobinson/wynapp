import { Button, Text, XStack, YStack, useTheme } from 'tamagui';

interface RecentActivityProps {
}

export function RecentActivity() {
  const theme = useTheme();

  return (
    <YStack marginTop="$4" space="$2">
      <Text fontSize="$4" fontWeight="600" color="$gray10">Recent Activity</Text>
      <XStack flexWrap="wrap" gap="$2">
        {['AI', 'Investments', 'Trading', 'Reports'].map((tag) => (
          <Button
            key={tag}
            size="$2"
            backgroundColor="$blue2"
            borderRadius="$4"
            color="$blue10"
          >
            {tag}
          </Button>
        ))}
      </XStack>
    </YStack>
  );
}