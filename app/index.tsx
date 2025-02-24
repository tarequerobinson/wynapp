import { Redirect } from 'expo-router';
import { Text, useTheme, YStack } from 'tamagui';

export default function Index() {
  const theme = useTheme();

  return (
    <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
      {/* Redirect to tabs/portfolio or show a landing page */}
      <Redirect href="/(tabs)/portfolio" />
      {/* Optional landing content */}
      <Text color="$color" fontSize="$6" fontWeight="bold">
        Welcome to Your Finance App
      </Text>
    </YStack>
  );
}