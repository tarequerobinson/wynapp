import { Link, Tabs, useRouter } from 'expo-router';
import { Button, Text, useTheme, YStack, XStack, ScrollView, Separator, Stack, Input } from 'tamagui';
import { 
  Wallet, Newspaper, BellRing, Calendar, MessagesSquare, Settings, 
  BotMessageSquare, ArrowLeftFromLine, Menu, 
  ChevronLeft,
  Search,
  Plus,
  MoreVertical,
  Filter,
  ArrowLeft
} from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Animated, Dimensions } from 'react-native';

interface ChatHistoryItem {
  id: string;
  title: string;
  date: Date;
}

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory] = useState<ChatHistoryItem[]>([
    { id: '1', title: 'Investment Options', date: new Date('2025-02-20') },
    { id: '2', title: 'Tax Questions', date: new Date('2025-02-19') },
  ]);


  const filteredChats = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
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
            name="index"
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
            name="modal"
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
                  backgroundColor="transparent"  // Add this line

                >
                  {/* <Text>Back</Text> */}
                </Button>
              ),
              headerRight: () => (
                <Button
                  mr="$1"
                  size="$3"
                  icon={<Menu size={20} />}
                  onPress={() => setSidebarOpen(true)}
                  backgroundColor="transparent"  // Add this line

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
              headerShown: false,
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

      <Stack
        position="absolute"
        left={sidebarOpen ? 0 : -300}
        top={0}
        bottom={0}
        width={300}
        backgroundColor={theme.name === 'dark' ? '$gray2Dark' : '$gray1Light'}
        borderRightWidth={1}
        borderRightColor={theme.borderColor?.val ?? '#e0e0e0'}
        animation="quick"
        padding="$4"
      >
        <YStack flex={1} space="$4">
          {/* Header with Collapse Button */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text 
              fontSize="$6" 
              fontWeight="bold" 
              color={theme.name === 'dark' ? '$gray12' : '$gray11'}
            >
              Chat History
            </Text>
            <Button
              size="$3"
              circular
              icon={<ChevronLeft size={20} />}
              onPress={() => setSidebarOpen(false)}
            />
          </XStack>

          {/* Search Bar */}
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
  <YStack/>
  
  {/* Filter chips */}
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



          {/* New Chat Button */}
          <Button
            icon={<Plus size={20} />}
            backgroundColor="$blue10"
            color="white"
            hoverStyle={{ backgroundColor: '$blue11' }}
            onPress={() => {
              // Add logic for new chat here
              setSidebarOpen(false);
            }}
          >
            New Chat
          </Button>

          {/* Chat History List */}
          <ScrollView flex={1}>
          {filteredChats.map((chat) => (
  <YStack 
    key={chat.id} 
    padding="$3"
    backgroundColor="$gray3"
    borderRadius="$2"
    marginBottom="$2"
    pressStyle={{ opacity: 0.8 }}
  >
    <XStack justifyContent="space-between" alignItems="center">
      <YStack>
        <Text 
          color={theme.name === 'dark' ? '$gray12' : '$gray11'}
          fontWeight="500"
        >
          {chat.title}
        </Text>
        <XStack alignItems="center" space="$1">
          <Stack 
            width={8} 
            height={8} 
            borderRadius={4} 
            backgroundColor={chat.id === '1' ? '$green9' : '$gray9'} 
          />
          <Text fontSize="$2" color="$gray9">
            {chat.date.toLocaleDateString()}
          </Text>
        </XStack>
      </YStack>
      <Button 
        size="$2" 
        circular 
        icon={<MoreVertical size={16} />}
      />
    </XStack>
  </YStack>
))}


            {filteredChats.length === 0 && (
              <Text color="$gray9" textAlign="center" marginTop="$4">
                No chats found
              </Text>
            )}
          </ScrollView>



          <YStack marginTop="$4" space="$2">
  <Text fontSize="$4" fontWeight="600" color="$gray11">Recent Activity</Text>
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


        </YStack>
      </Stack>

      {sidebarOpen && (
        <Stack
          position="absolute"
          left={300}
          top={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(0,0,0,0.4)"
          onPress={() => setSidebarOpen(false)}
        />
      )}
    </XStack>
    
  );
}