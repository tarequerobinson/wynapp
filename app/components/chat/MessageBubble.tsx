import { memo, useState, useEffect } from 'react';
import {
  XStack,
  YStack,
  Card,
  Button,
  Text,
  Avatar,
  AnimatePresence,
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
  const speakMessage = () => {
    if (message.sender === 'bot') {
      Speech.speak(message.text, { language: 'en' });
    }
  };

  // Typewriter effect state for bot messages
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(message.sender === 'bot');

  useEffect(() => {
    if (message.sender === 'bot') {
      let index = 0;
      const textToType = message.text;
      setDisplayedText(''); // Reset text
      setIsTyping(true);

      const typeInterval = setInterval(() => {
        if (index < textToType.length) {
          setDisplayedText((prev) => prev + textToType[index]);
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 20); // Adjusted to match the first example's 20ms per character

      return () => clearInterval(typeInterval);
    }
  }, [message.text, message.sender]);

  return (
    <XStack
      justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
      paddingHorizontal="$2"
      paddingVertical="$1"
    >
      {message.sender === 'bot' && (
        <Avatar circular size="$2" marginRight="$2">
          <Avatar.Image source={{ uri: 'YOUR_BOT_AVATAR_URL' }} />
          <Avatar.Fallback>
            <BotMessageSquare size={16} color="white" />
          </Avatar.Fallback>
        </Avatar>
      )}

      {message.sender === 'user' ? (
        // Updated user message bubble styling from the first example
        <YStack
          backgroundColor="#007AFF" // Blue like iMessage
          borderRadius="$6"
          borderTopRightRadius="$1" // Flattened top-right corner
          paddingHorizontal="$3.5"
          paddingVertical="$2.5"
          maxWidth="80%"
        >
          <Text 
            color="white" 
            fontSize={16} // Matches first example
            lineHeight={22} // Matches first example
          >
            {message.text}
          </Text>
          <Text 
            color="rgba(255,255,255,0.6)" // Slightly transparent white
            fontSize="$2"
            marginTop="$1"
            textAlign="right"
          >
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true // Matches first example
            })}
          </Text>
        </YStack>
      ) : (
        // Bot response: plain text with typewriter effect or special formatting
        <YStack maxWidth="80%">
          {message.type === 'goal' && message.goalData ? (
            <Card
              backgroundColor="#2F855A"
              borderRadius="$6"
              padding="$3"
              elevation={1}
            >
              <YStack space="$1">
                <XStack space="$1" alignItems="center">
                  <Timer size={14} color="$green9" />
                  <Text fontSize="$3" fontWeight="bold" color="$green9">
                    Goal Detected
                  </Text>
                </XStack>
                <Text fontSize="$4" fontWeight="medium" color="white">
                  {message.goalData.title}
                </Text>
                <Markdown
                  style={{
                    body: { color: 'white', fontSize: 14, lineHeight: 20 },
                    code_block: { backgroundColor: '#2D3748', padding: 8, borderRadius: 4 },
                    code_inline: { backgroundColor: '#2D3748', padding: 2, borderRadius: 2 },
                    link: { color: '$gray10' },
                  }}
                >
                  {message.text}
                </Markdown>
                <XStack space="$2">
                  <Text color="$gray4">Target: <Text fontWeight="bold">${message.goalData.target.toLocaleString()} JMD</Text></Text>
                  <Text color="$gray4">Timeframe: <Text fontWeight="bold">{message.goalData.timeframe}</Text></Text>
                </XStack>
                <XStack space="$1" marginTop="$1">
                  <Button size="$2" backgroundColor="$green9" onPress={() => onConfirmGoal?.(message.goalData)}>
                    Confirm
                  </Button>
                  <Button size="$2" backgroundColor="transparent" borderColor="$green9" borderWidth={1} color="$green9" onPress={() => onEditGoal?.(message.goalData)}>
                    Edit
                  </Button>
                </XStack>
              </YStack>
            </Card>
          ) : message.type === 'alert' && message.alertData ? (
            <Card
              backgroundColor="#D69E2E"
              borderRadius="$6"
              padding="$3"
              elevation={1}
            >
              <YStack space="$1">
                <XStack space="$1" alignItems="center">
                  <AlertTriangle size={14} color="$yellow9" />
                  <Text fontSize="$3" fontWeight="bold" color="$yellow9">
                    Alert Suggestion
                  </Text>
                </XStack>
                <Text fontSize="$4" fontWeight="medium" color="white">
                  {message.alertData.type.charAt(0).toUpperCase() + message.alertData.type.slice(1)} Alert
                </Text>
                <Markdown
                  style={{
                    body: { color: 'white', fontSize: 14, lineHeight: 20 },
                    code_block: { backgroundColor: '#2D3748', padding: 8, borderRadius: 4 },
                    code_inline: { backgroundColor: '#2D3748', padding: 2, borderRadius: 2 },
                    link: { color: '$gray10' },
                  }}
                >
                  {message.text}
                </Markdown>
                <YStack space="$1">
                  <Text color="$gray4">When: <Text fontWeight="bold">{message.alertData.target} {message.alertData.condition}</Text></Text>
                  <Text color="$gray4">Notify via: <Text fontWeight="bold">{message.alertData.notificationMethod.join(', ')}</Text></Text>
                </YStack>
                <XStack space="$1" marginTop="$1">
                  <Button size="$2" backgroundColor="$yellow9" onPress={() => onConfirmAlert?.(message.alertData)}>
                    Set
                  </Button>
                  <Button size="$2" backgroundColor="transparent" borderColor="$yellow9" borderWidth={1} color="$yellow9" onPress={() => onEditAlert?.(message.alertData)}>
                    Edit
                  </Button>
                </XStack>
              </YStack>
            </Card>
          ) : (
            <YStack space="$1">
              <AnimatePresence>
                <Text
                  color="$gray11"
                  fontSize="$4"
                  lineHeight="$5"
                  animation="quick"
                  enterStyle={{ opacity: 0 }}
                  exitStyle={{ opacity: 0 }}
                >
                  {displayedText}
                  {isTyping && <Text color="$gray8">|</Text>} {/* Blinking cursor */}
                </Text>
              </AnimatePresence>
              {!isTyping && (
                <XStack justifyContent="space-between" alignItems="center">
                  <Text color="$gray6" fontSize="$1" opacity={0.7}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Button
                    chromeless
                    size="$2"
                    icon={<Volume2 size={16} color="$gray10" />}
                    onPress={speakMessage}
                  />
                </XStack>
              )}
            </YStack>
          )}
        </YStack>
      )}
    </XStack>
  );
});