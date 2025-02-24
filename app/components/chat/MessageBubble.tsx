import { memo, useState, useEffect } from 'react';
import {
  XStack,
  YStack,
  Card,
  Button,
  Text,
  useTheme,
} from 'tamagui';
import {
  Volume2,
  BotMessageSquare,
  Timer,
  AlertTriangle,
} from '@tamagui/lucide-icons';
import Markdown from 'react-native-markdown-display';
import * as Speech from 'expo-speech';
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  onConfirmGoal?: (goalData: Message['goalData']) => void;
  onEditGoal?: (goalData: Message['goalData']) => void;
  onConfirmAlert?: (alertData: Message['alertData']) => void;
  onEditAlert?: (alertData: Message['alertData']) => void;
}

export const MessageBubble = memo(({
  message,
  onConfirmGoal,
  onEditGoal,
  onConfirmAlert,
  onEditAlert,
}: MessageBubbleProps) => {
  const theme = useTheme();
  const isDark = theme.name === 'dark';
  const [isVisible, setIsVisible] = useState(false);

  // Handle text-to-speech for bot messages
  const speakMessage = () => {
    if (message.sender === 'bot') {
      Speech.speak(message.text, { language: 'en', rate: 1.0 });
    }
  };

  // Fade-in effect for bot messages
  useEffect(() => {
    if (message.sender === 'bot') {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [message.sender]);

  // Timestamp formatting
  const formattedTime = message.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <XStack
      justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
      paddingHorizontal="$3"
      paddingVertical="$2"
      maxWidth="100%"
      animation="bouncy"
      opacity={isVisible ? 1 : 0}
      y={isVisible ? 0 : 5}
      enterStyle={{ opacity: 0, y: 5 }}
      exitStyle={{ opacity: 0, y: 5 }}
    >
      {/* Bot Icon */}
      {message.sender === 'bot' && (
        <BotMessageSquare
          size={24} // Slightly larger for visibility
          color={isDark ? '$gray10' : '$gray9'} // Adjusts with theme
          marginRight="$3"
        />
      )}

      {/* Message Content */}
      <YStack maxWidth="85%" space="$1">
        {message.sender === 'user' ? (
          <YStack
            backgroundColor="$blue9"
            borderRadius="$5"
            borderTopRightRadius="$1"
            padding="$3"
            elevation={isDark ? 1 : 0}
          >
            <Text color="$white" fontSize="$4" lineHeight="$5">
              {message.text}
            </Text>
            <Text color="$gray7" fontSize="$2" textAlign="right" marginTop="$1">
              {formattedTime}
            </Text>
          </YStack>
        ) : (
          <>
            {message.type === 'goal' && message.goalData ? (
              <Card
                backgroundColor={isDark ? '$green9' : '$green7'}
                borderRadius="$5"
                padding="$4"
                elevation={isDark ? 2 : 0}
                borderWidth={1}
                borderColor="$green6"
              >
                <YStack space="$2">
                  <XStack alignItems="center" space="$2">
                    <Timer size={16} color="$green7" />
                    <Text fontSize="$4" fontWeight="600" color="$green7">
                      Goal Detected
                    </Text>
                  </XStack>
                  <Text fontSize="$5" fontWeight="700" color="$white">
                    {message.goalData.title}
                  </Text>
                  <Markdown
                    style={{
                      body: { color: '$gray12', fontSize: 15, lineHeight: 22 },
                      code_block: { backgroundColor: '$gray4', padding: 8, borderRadius: 4 },
                      code_inline: { backgroundColor: '$gray4', padding: 2, borderRadius: 2 },
                      link: { color: '$blue9' },
                    }}
                  >
                    {message.text}
                  </Markdown>
                  <XStack space="$3" flexWrap="wrap">
                    <Text color="$gray6">
                      Target: <Text fontWeight="600">${message.goalData.target.toLocaleString()} JMD</Text>
                    </Text>
                    <Text color="$gray6">
                      Timeframe: <Text fontWeight="600">{message.goalData.timeframe}</Text>
                    </Text>
                  </XStack>
                  <XStack space="$2" marginTop="$2">
                    <Button
                      size="$3"
                      backgroundColor="$green8"
                      color="$white"
                      borderRadius="$3"
                      onPress={() => onConfirmGoal?.(message.goalData)}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="$3"
                      variant="outlined"
                      borderColor="$green8"
                      color="$green8"
                      borderRadius="$3"
                      onPress={() => onEditGoal?.(message.goalData)}
                    >
                      Edit
                    </Button>
                  </XStack>
                </YStack>
              </Card>
            ) : message.type === 'alert' && message.alertData ? (
              <Card
                backgroundColor={isDark ? '$yellow9' : '$yellow7'}
                borderRadius="$5"
                padding="$4"
                elevation={isDark ? 2 : 0}
                borderWidth={1}
                borderColor="$yellow6"
              >
                <YStack space="$2">
                  <XStack alignItems="center" space="$2">
                    <AlertTriangle size={16} color="$yellow7" />
                    <Text fontSize="$4" fontWeight="600" color="$yellow7">
                      Alert Suggestion
                    </Text>
                  </XStack>
                  <Text fontSize="$5" fontWeight="700" color="$white">
                    {message.alertData.type.charAt(0).toUpperCase() + message.alertData.type.slice(1)} Alert
                  </Text>
                  <Markdown
                    style={{
                      body: { color: '$gray12', fontSize: 15, lineHeight: 22 },
                      code_block: { backgroundColor: '$gray4', padding: 8, borderRadius: 4 },
                      code_inline: { backgroundColor: '$gray4', padding: 2, borderRadius: 2 },
                      link: { color: '$blue9' },
                    }}
                  >
                    {message.text}
                  </Markdown>
                  <YStack space="$1">
                    <Text color="$gray6">
                      When: <Text fontWeight="600">{message.alertData.target} {message.alertData.condition}</Text>
                    </Text>
                    <Text color="$gray6">
                      Notify via: <Text fontWeight="600">{message.alertData.notificationMethod.join(', ')}</Text>
                    </Text>
                  </YStack>
                  <XStack space="$2" marginTop="$2">
                    <Button
                      size="$3"
                      backgroundColor="$yellow8"
                      color="$white"
                      borderRadius="$3"
                      onPress={() => onConfirmAlert?.(message.alertData)}
                    >
                      Set
                    </Button>
                    <Button
                      size="$3"
                      variant="outlined"
                      borderColor="$yellow8"
                      color="$yellow8"
                      borderRadius="$3"
                      onPress={() => onEditAlert?.(message.alertData)}
                    >
                      Edit
                    </Button>
                  </XStack>
                </YStack>
              </Card>
            ) : (
              <YStack
                backgroundColor={isDark ? '$gray3' : '$gray2'}
                borderRadius="$5"
                padding="$3"
                elevation={isDark ? 1 : 0}
              >
                <Text
                  color={isDark ? '$gray11' : '$gray12'}
                  fontSize="$4"
                  lineHeight="$5"
                  fontFamily="$body"
                >
                  {message.text}
                </Text>
                <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
                  <Text color="$gray7" fontSize="$2">
                    {formattedTime}
                  </Text>
                  <Button
                    chromeless
                    size="$2"
                    icon={<Volume2 size={18} color="$gray10" />}
                    onPress={speakMessage}
                  />
                </XStack>
              </YStack>
            )}
          </>
        )}
      </YStack>
    </XStack>
  );
});