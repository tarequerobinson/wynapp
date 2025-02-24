import { Link, Tabs, useRouter } from 'expo-router';
import { Button, Stack, Text, useTheme, XStack, YStack } from 'tamagui';
import { 
  Wallet, Newspaper, BellRing, Calendar, MessagesSquare, Settings, 
  BotMessageSquare, ArrowLeft, Menu 
} from '@tamagui/lucide-icons';
import { useState } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';

interface ChatHistoryItem {
  id: string;
  title: string;
  date: Date;
}

export default function TabLayout() {
  const theme = useTheme();
  const isDark = theme.name === 'dark';
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory] = useState<ChatHistoryItem[]>([
    { id: '1', title: 'Investment Options', date: new Date('2025-02-20') },
    { id: '2', title: 'Tax Questions', date: new Date('2025-02-19') },
  ]);

  return (
    <XStack flex={1}>
      <Stack flex={1} x={sidebarOpen ? 300 : 0}>
        <Tabs
          screenOptions={{
            tabBarHideOnKeyboard: true,
            tabBarActiveTintColor: theme.blue10?.val,
            tabBarInactiveTintColor: theme.gray8?.val,
            tabBarStyle: {
              backgroundColor: isDark ? theme.gray1Dark?.val : theme.background?.val,
              borderTopColor: theme.borderColor?.val,
              height: 65,
              paddingBottom: 10,
            },
            headerStyle: {
              backgroundColor: isDark ? theme.gray1Dark?.val : theme.background?.val,
              borderBottomColor: theme.borderColor?.val,
              height: 60,
            },
            headerTintColor: theme.color?.val,
            // Removed transitionSpec and cardStyleInterpolator to avoid animation errors
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
                      backgroundColor="$blue10" 
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
                      backgroundColor="$blue10" 
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
                  backgroundColor={focused ? '$blue10' : '$background'}
                  borderRadius={30}
                  padding="$2"
                  marginTop={-25}
                  borderWidth={2}
                  borderColor="$blue10"
                  shadowColor="$gray8"
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
                      backgroundColor="$blue10" 
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
                      backgroundColor="$blue10" 
                      marginTop={4} 
                    />
                  )}
                </YStack>
              ),
            }}
          />
        </Tabs>
      </Stack>
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        chatHistory={chatHistory} 
      />
    </XStack>
  );
}