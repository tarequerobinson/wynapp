import { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, Keyboard, Platform } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { Provider } from './Provider';
import { useTheme, YStack } from 'tamagui';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native';
import { useFonts } from 'expo-font';
import { useAuth } from './context/AuthContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)', // Default to tabs when authenticated
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Provider>
        <RootLayoutNav />
      </Provider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // Track if component is mounted

  // Handle keyboard visibility
  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    setIsMounted(true); // Set mounted flag on mount
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // Redirect to login if not authenticated, but only after mounting
  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      console.log('RootLayoutNav: Redirecting to /');
      router.replace('/');
    }
  }, [isMounted, isAuthenticated, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.val }}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <YStack flex={1}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="settings"
                options={{
                  headerShown: false,
                  title: 'Settings',
                }}
              />
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
          </YStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemeProvider>
  );
}