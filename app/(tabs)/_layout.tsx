import { Link, Tabs } from 'expo-router'
import { Button, useTheme } from 'tamagui'
import {
  Wallet,
  Newspaper,
  BellRing,
  Calendar,
  User
} from '@tamagui/lucide-icons'

export default function TabLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.blue10.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
        },
        headerStyle: {
          backgroundColor: theme.background.val,
          borderBottomColor: theme.borderColor.val,
        },
        headerTintColor: theme.color.val,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => <Wallet color={color as any} size={20} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Button mr="$4" bg="$green8" color="$green12">
                Update
              </Button>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <Newspaper color={color as any} size={20} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <BellRing color={color as any} size={20} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Calendar color={color as any} size={20} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color as any} size={20} />,
        }}
      />
    </Tabs>
  )
}