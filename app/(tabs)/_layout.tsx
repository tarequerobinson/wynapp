import { Link, Tabs } from 'expo-router'
import { Button, useTheme, YStack } from 'tamagui'
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import {
  Wallet,
  Newspaper,
  BellRing,
  Calendar,
  MessageCircle,
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
          tabBarIcon: ({ color }) => <Newspaper color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="modal"
        options={{
          title: 'Chat',
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <YStack
              animation="quick"
              {...(focused && {
                animateOnly: ['transform'],
                scale: 1.1,
                rotate: '0deg',  // Initial state
                keyframes: {
                  '0%': { rotate: '0deg' },
                  '25%': { rotate: '5deg' },
                  '75%': { rotate: '-5deg' },
                  '100%': { rotate: '0deg' },
                },
                animationDuration: '500ms',
                animationIterationCount: 'infinite',
              })}
              justifyContent="center"
              alignItems="center"
            >
              
              
                            <MessageCircle
                size={size * 1.7}
                color={focused ? theme.blue10?.val : theme.gray7?.val}
                backgroundColor={focused ? theme.purple8?.val : theme.gray5?.val}
                borderWidth={3}
                borderColor={focused ? theme.purple10?.val : theme.gray7?.val}
                borderRadius={size * 0.85}
                padding={6}
                shadowColor={focused ? theme.gray8?.val : 'transparent'}
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.9}
                shadowRadius={6}
                elevation={focused ? 8 : 2}
              >
                <MessageCircle
                  size={size}
                  color={focused ? theme.white?.val : theme.gray10?.val}
                  strokeWidth={focused ? 2.5 : 2}
                />
              </MessageCircle>
            </YStack>
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
            marginBottom: 2,
          },
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <BellRing color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Calendar color={color} size={20} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  wiggle: {
    animation: 'wiggle 0.5s ease-in-out infinite',
  },
  '@keyframes wiggle': {
    '0%': { transform: 'rotate(0deg)' },
    '25%': { transform: 'rotate(5deg)' },
    '75%': { transform: 'rotate(-5deg)' },
    '100%': { transform: 'rotate(0deg)' },
  },
})