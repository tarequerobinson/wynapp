// src/components/chat/ChatbotFAB.tsx
import { useState, useEffect } from 'react';
import { MessageCircle } from '@tamagui/lucide-icons';
import { Stack, Button, AnimatePresence } from 'tamagui';
import { useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter, usePathname } from 'expo-router';

export const ChatbotFAB = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const { width, height } = useWindowDimensions();
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android' || width < 768;

  // Hide FAB when on the chat modal page
  useEffect(() => {
    setIsVisible(pathname !== '/modal');
  }, [pathname]);

  const handlePress = () => {
    // Optional: Trigger animation before navigation
    setIsVisible(false);
    // Navigation is handled by Link, this just manages visibility
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <Stack
          animation="quick"
          enterStyle={{
            opacity: 0,
            scale: 0.8,
          }}
          exitStyle={{
            opacity: 0,
            scale: 0.8,
          }}
          position="absolute"
          bottom={isMobile ? 16 + insets.bottom : 20}
          right={isMobile ? 16 + insets.right : 20}
          zIndex={50}
        >
          <Link href="/modal" asChild>
            <Button
              size={isMobile ? '$7' : '$6'}
              circular
              pressStyle={{ scale: 0.95 }}
              hoverStyle={{ scale: 1.05 }}
              onPress={handlePress}
              bg="$blue10"
              shadowColor="$shadowColor"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={6}
              elevation={5}
            >
              <MessageCircle size={isMobile ? 28 : 24} color="white" />
            </Button>
          </Link>
        </Stack>
      )}
    </AnimatePresence>
  );
};