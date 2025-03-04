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
          size={24}
          color={isDark ? '$gray10' : '$gray9'}
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
            opa={1} // Ensure no transparency
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
                backgroundColor={isDark ? '$green6' : '$green5'} // Bright, saturated green
                borderRadius="$5"
                padding="$4"
                elevation={isDark ? 3 : 2} // Higher elevation for dark mode
                borderWidth={1}
                borderColor={isDark ? '$green5' : '$green4'} // Vivid border
                opa={1} // Force solid color
              >
                <YStack space="$2">
                  <XStack alignItems="center" space="$2">
                    <Timer size={16} color={isDark ? '$green8' : '$green7'} />
                    <Text fontSize="$4" fontWeight="600" color={isDark ? '$green8' : '$green7'}>
                      Goal Detected
                    </Text>
                  </XStack>
                  <Text fontSize="$5" fontWeight="700" color={isDark ? '$white' : '$gray1'}>
                    {message.goalData.title}
                  </Text>
                  <Markdown
                    style={{
                      body: { color: isDark ? '$gray11' : '$gray12', fontSize: 15, lineHeight: 22 },
                      code_block: { backgroundColor: '$gray4', padding: 8, borderRadius: 4 },
                      code_inline: { backgroundColor: '$gray4', padding: 2, borderRadius: 2 },
                      link: { color: '$blue9' },
                    }}
                  >
                    {message.text}
                  </Markdown>
                  <XStack space="$3" flexWrap="wrap">
                    <Text color={isDark ? '$gray7' : '$gray6'}>
                      Target: <Text fontWeight="600">${message.goalData.target.toLocaleString()} JMD</Text>
                    </Text>
                    <Text color={isDark ? '$gray7' : '$gray6'}>
                      Timeframe: <Text fontWeight="600">{message.goalData.timeframe}</Text>
                    </Text>
                  </XStack>
                  <XStack space="$2" marginTop="$2">
                    <Button
                      size="$3"
                      backgroundColor={isDark ? '$green7' : '$green6'}
                      color="$white"
                      borderRadius="$3"
                      onPress={() => onConfirmGoal?.(message.goalData)}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="$3"
                      variant="outlined"
                      borderColor={isDark ? '$green7' : '$green6'}
                      color={isDark ? '$green7' : '$green6'}
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
                backgroundColor={isDark ? '$yellow6' : '$yellow5'} // Vivid, popping yellow
                borderRadius="$5"
                padding="$4"
                elevation={isDark ? 3 : 2}
                borderWidth={1}
                borderColor={isDark ? '$yellow5' : '$yellow4'} // Bright border
                opa={1} // No transparency
              >
                <YStack space="$2">
                  <XStack alignItems="center" space="$2">
                    <AlertTriangle size={16} color={isDark ? '$yellow8' : '$yellow7'} />
                    <Text fontSize="$4" fontWeight="600" color={isDark ? '$yellow8' : '$yellow7'}>
                      Alert Suggestion
                    </Text>
                  </XStack>
                  <Text fontSize="$5" fontWeight="700" color={isDark ? '$white' : '$gray1'}>
                    {message.alertData.type.charAt(0).toUpperCase() + message.alertData.type.slice(1)} Alert
                  </Text>
                  <Markdown
                    style={{
                      body: { color: isDark ? '$gray11' : '$gray12', fontSize: 15, lineHeight: 22 },
                      code_block: { backgroundColor: '$gray4', padding: 8, borderRadius: 4 },
                      code_inline: { backgroundColor: '$gray4', padding: 2, borderRadius: 2 },
                      link: { color: '$blue9' },
                    }}
                  >
                    {message.text}
                  </Markdown>
                  <YStack space="$1">
                    <Text color={isDark ? '$gray7' : '$gray6'}>
                      When: <Text fontWeight="600">{message.alertData.target} {message.alertData.condition}</Text>
                    </Text>
                    <Text color={isDark ? '$gray7' : '$gray6'}>
                      Notify via: <Text fontWeight="600">{message.alertData.notificationMethod.join(', ')}</Text>
                    </Text>
                  </YStack>
                  <XStack space="$2" marginTop="$2">
                    <Button
                      size="$3"
                      backgroundColor={isDark ? '$yellow7' : '$yellow6'}
                      color="$white"
                      borderRadius="$3"
                      onPress={() => onConfirmAlert?.(message.alertData)}
                    >
                      Set
                    </Button>
                    <Button
                      size="$3"
                      variant="outlined"
                      borderColor={isDark ? '$yellow7' : '$yellow6'}
                      color={isDark ? '$yellow7' : '$yellow6'}
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
                opa={1}
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