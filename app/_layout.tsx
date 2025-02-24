import { useEffect, useState } from 'react'
import { StatusBar, useColorScheme, Keyboard, Platform } from 'react-native'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { SplashScreen, Stack } from 'expo-router'
import { Provider } from './Provider'
import { useTheme, YStack } from 'tamagui'
import { ChatbotFAB } from './components/chat/ChatbotFAB'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAvoidingView } from 'react-native'
import { useFonts } from 'expo-font'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (interLoaded || interError) {
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError])

  if (!interLoaded && !interError) {
    return null
  }

  return (
    <SafeAreaProvider>
      <Provider>
        <RootLayoutNav />
      </Provider>
    </SafeAreaProvider>
  )
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const theme = useTheme()
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true))
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false))
    return () => {
      showListener.remove()
      hideListener.remove()
    }
  }, [])

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
                  headerShown: false, // Hide header for settings screen
                  title: 'Settings' // Optional: Set a title for navigation if needed elsewhere
                }}
              />
            </Stack>
          </YStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemeProvider>
  )
}