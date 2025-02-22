import { Link, Tabs } from 'expo-router'
import { Button, useTheme, YStack } from 'tamagui'
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import {
  Wallet,
  Newspaper,
  BellRing,
  Calendar,
  MessageCircle,
  BotMessageSquare,
  Settings2,
  Settings,
  MessagesSquare,
} from '@tamagui/lucide-icons'




export default function TabLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.blue10?.val ?? '#1e90ff',
        tabBarStyle: {
          backgroundColor: theme.background?.val ?? '#ffffff',
          borderTopColor: theme.borderColor?.val ?? '#e0e0e0',
        },
        headerStyle: {
          backgroundColor: theme.background?.val ?? '#ffffff',
          borderBottomColor: theme.borderColor?.val ?? '#e0e0e0',
        },
        headerTintColor: theme.color?.val ?? '#000000',
      }}
    >
<Tabs.Screen
    name="index"
    options={{
      title: 'Portfolio',
      tabBarIcon: ({ color }) => <Wallet color={color} size={20} />,
      headerRight: () => (
        <Link href="/settings" asChild>
          <Button
            mr="$4"
            // bg="$green8"
            // color="$green12"
            circular // Makes it a round button
            size="$3" // Adjust size as needed
            icon={<Settings size={20} />}
          />
        </Link>
      ),
    }}
  />


      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          headerShown: false,

          tabBarIcon: ({ color }) => <Newspaper color={color} size={20} />,
        }}
      />
<Tabs.Screen
  name="modal"
  options={{
    title: 'Chat',
    headerShown: false,
    tabBarIcon: ({ focused, size }) => (
      <MessagesSquare
        size={size * 2}
        color={focused ? theme.blue10?.val : theme.gray7?.val}
        backgroundColor={focused ? theme.purple8?.val : theme.gray5?.val}
        borderWidth={4}
        borderColor={theme.background?.val}  // Creates a gap effect
        borderRadius={size}
        padding={8}
        position="absolute"  // Floats above tab bar
        top={-10}  // Raises it above other icons
        shadowColor={theme.gray8?.val}
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.9}
        shadowRadius={6}
      >
        <MessagesSquare
          size={size}
          color={focused ? theme.white?.val : theme.gray10?.val}
        />
      </MessagesSquare>
    ),    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '700',  // Bolder label
      marginBottom: 2,
    },
  }}
/>

      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          headerShown: false,

          tabBarIcon: ({ color }) => <BellRing color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Events',
          headerShown: false,

          tabBarIcon: ({ color }) => <Calendar color={color} size={20} />,
        }}
      />
    </Tabs>
  )
}

