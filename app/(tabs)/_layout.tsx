import { Link, Tabs, useRouter } from 'expo-router';
import { Button, Stack, Text, useTheme, View, XStack, YStack } from 'tamagui';
import { 
  Wallet, Newspaper, BellRing, Calendar, MessagesSquare, Settings, 
  BotMessageSquare, ArrowLeftFromLine, Menu, ArrowLeft 
} from '@tamagui/lucide-icons';
import { useState, useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, Appearance } from 'react-native';
import Sidebar from '@/components/sidebar/Sidebar';

interface ChatHistoryItem {
  id: string;
  title: string;
  date: Date;
}

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Add searchQuery state
  const [chatHistory] = useState<ChatHistoryItem[]>([
    { id: '1', title: 'Investment Options', date: new Date('2025-02-20') },
    { id: '2', title: 'Tax Questions', date: new Date('2025-02-19') },
  ]);
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, []);

  const tabTransition = ({ position, progress }: any) => {
    const inputRange = [0, 1];
    const translateX = position.interpolate({
      inputRange,
      outputRange: [300, 0],
    });
    const opacity = progress.interpolate({
      inputRange,
      outputRange: [0, 1],
    });
    const scale = progress.interpolate({
      inputRange,
      outputRange: [0.95, 1],
    });

    return {
      transform: [{ translateX }, { scale }],
      opacity,
    };
  };

  return (
    <XStack flex={1}>
      <Stack 
        flex={1} 
        animation="quick"
        x={sidebarOpen ? 300 : 0}
      >
        <Tabs
          screenOptions={{
            tabBarHideOnKeyboard: true,
            tabBarActiveTintColor: theme.blue10?.val ?? '#1e90ff',
            tabBarInactiveTintColor: theme.gray8?.val ?? '#888888',
            tabBarStyle: {
              backgroundColor: theme.background?.val ?? '#ffffff',
              borderTopColor: theme.borderColor?.val ?? '#e0e0e0',
              height: 65,
              paddingBottom: 10,
            },
            headerStyle: {
              backgroundColor: theme.background?.val ?? '#ffffff',
              borderBottomColor: theme.borderColor?.val ?? '#e0e0e0',
              height: 60,
            },
            headerTintColor: theme.color?.val ?? '#000000',
            animationEnabled: true,
            tabBarOptions: {
              animation: 'default',
            },
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 300 } },
              close: { animation: 'timing', config: { duration: 300 } },
            },
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                  {
                    scale: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            }),
          }}
        >
          <Tabs.Screen
            name="portfolio"
            options={{
              title: 'Portfolio',
              tabBarIcon: ({ color, focused }) => (
                <YStack alignItems="center">
                  <Wallet color={color} size={22} />
                  {focused && (
                    <Stack 
                      height={3} 
                      width={3} 
                      borderRadius={1.5} 
                      backgroundColor={theme.blue10?.val} 
                      marginTop={4} 
                    />
                  )}
                </YStack>
              ),
              headerRight: () => (
                <Link href="/settings" asChild>
                  <Button mr="$4" circular size="$3" icon={<Settings size={20} />} />
                </Link>
              ),
            }}
          />
          <Tabs.Screen
            name="news"
            options={{
              title: 'News',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <YStack alignItems="center">
                  <Newspaper color={color} size={22} />
                  {focused && (
                    <Stack 
                      height={3} 
                      width={3} 
                      borderRadius={1.5} 
                      backgroundColor={theme.blue10?.val} 
                      marginTop={4} 
                    />
                  )}
                </YStack>
              ),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: 'Assistant',
              headerShown: true,
              tabBarStyle: { display: 'none' },
              headerTitle: () => (
                <XStack alignItems="center" space="$2">
                  <BotMessageSquare size={20} />
                  <Text>Assistant</Text>
                </XStack>
              ),
              headerLeft: () => (
                <Button
                  ml="$1"
                  size="$3"
                  icon={<ArrowLeft size={20} />}
                  onPress={() => router.back()}
                  backgroundColor="transparent"
                />
              ),
              headerRight: () => (
                <Button
                  mr="$1"
                  size="$3"
                  icon={<Menu size={20} />}
                  onPress={() => setSidebarOpen(true)}
                  backgroundColor="transparent"
                />
              ),
              tabBarIcon: ({ focused }) => (
                <Stack
                  backgroundColor={focused ? theme.blue10?.val : theme.background?.val}
                  borderRadius={30}
                  padding="$2"
                  marginTop={-25}
                  borderWidth={2}
                  borderColor={theme.blue10?.val}
                  shadowColor={theme.gray8?.val}
                  shadowOffset={{ width: 0, height: 4 }}
                  shadowOpacity={0.3}
                  shadowRadius={8}
                >
                  <MessagesSquare
                    size={28}
                    color={focused ? theme.background?.val : theme.blue10?.val}
                  />
                </Stack>
              ),
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '700',
                marginBottom: 2,
                marginTop: 12,
              },
            }}
          />
          <Tabs.Screen
            name="alerts"
            options={{
              title: 'Alerts',
              headerShown: true,
              tabBarIcon: ({ color, focused }) => (
                <YStack alignItems="center">
                  <BellRing color={color} size={22} />
                  {focused && (
                    <Stack 
                      height={3} 
                      width={3} 
                      borderRadius={1.5} 
                      backgroundColor={theme.blue10?.val} 
                      marginTop={4} 
                    />
                  )}
                </YStack>
              ),
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              title: 'Events',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <YStack alignItems="center">
                  <Calendar color={color} size={22} />
                  {focused && (
                    <Stack 
                      height={3} 
                      width={3} 
                      borderRadius={1.5} 
                      backgroundColor={theme.blue10?.val} 
                      marginTop={4} 
                    />
                  )}
                </YStack>
              ),
            }}
          />
        </Tabs>
      </Stack>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} chatHistory={chatHistory} />
    </XStack>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});