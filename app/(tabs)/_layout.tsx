import { Link, Tabs, useRouter } from 'expo-router';
import { Button, H4, Stack, Text, useTheme, XStack, YStack } from 'tamagui';
import { 
  Wallet, Newspaper, BellRing, Calendar, MessagesSquare, Settings, 
  BotMessageSquare, ArrowLeft, Menu, Search 
} from '@tamagui/lucide-icons';
import { useCallback, useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

interface ChatHistoryItem {
  id: string;
  title: string;
  date: Date;
}

export default function TabLayout() {
  const theme = useTheme();
  const isDark = theme.name === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory] = useState<ChatHistoryItem[]>([
    { id: '1', title: 'Investment Options', date: new Date('2025-02-20') },
    { id: '2', title: 'Tax Questions', date: new Date('2025-02-19') },
    { id: '3', title: 'Retirement Planning', date: new Date('2025-02-18') },
    { id: '4', title: 'Stock Analysis', date: new Date('2025-02-15') },
  ]);

  const { isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      console.log('TabLayout: Redirecting to / due to unauthenticated user');
      router.replace('/');
    }
  }, [isMounted, isAuthenticated, router]);

  const TabIcon = useCallback(({ Icon, color, focused }) => (
    <YStack alignItems="center" space="$1">
      <Icon color={color} size={23} />
      {focused && (
        <Stack 
          height={4} 
          width={4} 
          borderRadius={2} 
          backgroundColor={theme.blue10?.val} 
          marginTop={3} 
        />
      )}
    </YStack>
  ), [theme]);

  const CentralTabIcon = useCallback(({ focused }) => (
    <Stack
      backgroundColor={focused ? theme.blue10?.val : theme.background?.val}
      borderRadius={30}
      padding="$2.5"
      marginTop={-30}
      borderWidth={2}
      borderColor={theme.blue10?.val}
      shadowColor={theme.shadowColor?.val}
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.2}
      shadowRadius={8}
      elevation={5}
    >
      <MessagesSquare
        size={28}
        color={focused ? theme.background?.val : theme.blue10?.val}
      />
    </Stack>
  ), [theme]);

  const renderTabBarButton = props => (
    <Button unstyled pressStyle={{ opacity: 0.85 }} {...props} />
  );

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
              borderTopWidth: 1,
              height: 65 + insets.bottom,
              paddingBottom: 10 + insets.bottom,
              shadowColor: theme.shadowColor?.val,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 5,
            },
            headerStyle: {
              backgroundColor: isDark ? theme.gray1Dark?.val : theme.background?.val,
              borderBottomColor: theme.borderColor?.val,
              borderBottomWidth: 1,
              height: 60 + insets.top,
              paddingTop: insets.top,
              shadowColor: theme.shadowColor?.val,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 3,
            },
            headerTintColor: theme.color?.val,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Tabs.Screen
            name="portfolio"
            options={{
              title: 'Portfolio',
              tabBarButton: renderTabBarButton,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon Icon={Wallet} color={color} focused={focused} />
              ),
              headerRight: () => (
                <Link href="/settings" asChild>
                  <Button 
                    mr="$4" 
                    circular 
                    size="$3" 
                    icon={<Settings size={20} color={theme.color?.val} />} 
                    backgroundColor="transparent" 
                    pressStyle={{ opacity: 0.7 }} 
                  />
                </Link>
              ),
            }}
          />
          <Tabs.Screen
            name="news"
            options={{
              headerShown: false,
              title: 'News',
              tabBarButton: renderTabBarButton,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon Icon={Newspaper} color={color} focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: 'Assistant',
              tabBarButton: renderTabBarButton,
              tabBarStyle: { display: 'none' },
              tabBarIcon: () => <CentralTabIcon focused={true} />,
              headerTitle: () => (
                <XStack alignItems="center" space="$2.5">
                  <BotMessageSquare size={20} color={theme.blue10?.val} />
                  <Text fontWeight="600" color={theme.color?.val}>Financial Assistant</Text>
                </XStack>
              ),
              headerLeft: () => (
                <Button
                  ml="$3"
                  size="$3"
                  icon={<ArrowLeft size={20} color={theme.color?.val} />}
                  onPress={() => router.back()}
                  backgroundColor="transparent"
                  pressStyle={{ opacity: 0.7 }}
                />
              ),
              headerRight: () => (
                <Button
                  mr="$3"
                  size="$3"
                  icon={<Menu size={20} color={theme.color?.val} />}
                  onPress={() => setSidebarOpen(true)}
                  backgroundColor="transparent"
                  pressStyle={{ opacity: 0.7 }}
                />
              ),
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                marginBottom: 2,
                marginTop: 12,
              },
            }}
          />
          <Tabs.Screen
            name="alerts"
            options={{
              title: 'Alerts',
              tabBarButton: renderTabBarButton,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon Icon={BellRing} color={color} focused={focused} />
              ),
              headerTitle: () => (
                <XStack alignItems="center" space="$2">
                  <BellRing size={20} color={theme.blue10?.val} />
                  <H4 color="$color" fontSize="$6" fontWeight="800">
                    Market Alerts
                  </H4>
                </XStack>
              ),
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              headerShown: false,
              title: 'Events',
              tabBarButton: renderTabBarButton,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon Icon={Calendar} color={color} focused={focused} />
              ),
              headerTitle: () => (
                <XStack alignItems="center" space="$2">
                  <Calendar size={20} color={theme.blue10?.val} />
                  <Text fontWeight="600" color={theme.color?.val}>Financial Calendar</Text>
                </XStack>
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