import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  XStack,
  YStack,
  Input,
  Button,
  ScrollView,
  Card,
  AnimatePresence,
  Spinner,
  Sheet,
  Label,
  useTheme,
} from 'tamagui';
import { Send, X, Maximize2, Minimize2, File, BotMessageSquare, Mic, Moon, Sun } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  type?: 'regular' | 'goal' | 'alert';
  goalData?: { title: string; target: number; timeframe: string; description?: string };
  alertData?: { type: 'price' | 'market' | 'news'; target: string; condition: string; notificationMethod: string[] };
};

interface ChatbotProps {
  onClose: () => void;
  initialMessage?: string;
  botName?: string;
}

export const Chatbot = ({
  onClose,
  initialMessage = 'Hello! I’m your Financial Assistant. How can I assist you today?',
  botName = 'Financial Assistant',
}: ChatbotProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Message['goalData'] | null>(null);
  const [editingAlert, setEditingAlert] = useState<Message['alertData'] | null>(null);
  const [isDark, setIsDark] = useState(theme.name === 'dark');
  const scrollViewRef = useRef<ScrollView>(null);

  const API_KEY = 'AIzaSyBcAssZdWRIWLgKTJABJVu6t3vJvvBCp24';
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'initial',
          text: initialMessage,
          sender: 'bot',
          timestamp: new Date(),
          status: 'sent',
        },
      ]);
    }
  }, [initialMessage]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const quickPrompts = [
    { text: 'Top investments for 2025?', icon: <BotMessageSquare size={16} /> },
    { text: 'Diversify my portfolio?', icon: <BotMessageSquare size={16} /> },
    { text: 'Market trends today?', icon: <BotMessageSquare size={16} /> },
  ];

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await model.generateContent(input);
      const responseText = result.response.text();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
        type: 'regular',
      };

      setMessages((prev) =>
        prev
          .map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg))
          .concat(botMessage)
      );
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, something went wrong. Try again.',
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
        type: 'regular',
      };
      setMessages((prev) =>
        prev
          .map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'error' } : msg))
          .concat(errorMessage)
      );
    } finally {
      setIsTyping(false);
    }
  }, [input, model]);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    handleSend();
  };

  const MessageBubble = ({ message }: { message: Message }) => (
    <AnimatePresence>
      <XStack
        justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
        paddingHorizontal="$2"
        paddingVertical="$1"
      >
        <Card
          elevate
          backgroundColor={message.sender === 'user' ? '$blue10' : '$gray3'}
          borderRadius="$4"
          padding="$2"
          maxWidth="85%"
        >
          <YStack>
            <Markdown
              style={{
                body: {
                  color: message.sender === 'user' ? theme.white?.val : theme.color?.val,
                  fontSize: 14,
                },
              }}
            >
              {message.text}
            </Markdown>
            <Text
              color={message.sender === 'user' ? '$blue2' : '$gray9'}
              fontSize="$1"
              opacity={0.7}
            >
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </YStack>
        </Card>
      </XStack>
    </AnimatePresence>
  );

  return (
    <View flex={1}>
      <YStack
        flex={1}
        paddingTop={insets.top}
        paddingBottom={insets.bottom}
        backgroundColor="$background"
      >
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" padding="$2">
          <Text color="$white" fontWeight="bold">{botName}</Text>
          <XStack space="$1">
            <Button
              size="$2"
              circular
              icon={isDark ? Sun : Moon}
              onPress={() => setIsDark(!isDark)}
            />
            <Button
              size="$2"
              circular
              icon={isFullscreen ? Minimize2 : Maximize2}
              onPress={() => setIsFullscreen(!isFullscreen)}
            />
            <Button size="$2" circular icon={X} onPress={onClose} />
          </XStack>
        </XStack>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          flex={1}
          contentContainerStyle={{ paddingVertical: 10 }}
          showsVerticalScrollIndicator={false}
        >
          <YStack space="$1">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && (
              <XStack paddingHorizontal="$2">
                <Spinner size="small" color="$gray10" />
              </XStack>
            )}
          </YStack>
        </ScrollView>

        {/* Quick Prompts */}
        <XStack padding="$2" space="$1" overflow="scroll">
          {quickPrompts.map((prompt, idx) => (
            <Button
              key={idx}
              size="$2"
              backgroundColor="$gray3"
              borderRadius="$3"
              onPress={() => handlePromptClick(prompt.text)}
            >
              <XStack space="$1" alignItems="center">
                {prompt.icon}
                <Text fontSize="$2" color="$color">{prompt.text}</Text>
              </XStack>
            </Button>
          ))}
        </XStack>

        {/* Input Area */}
        <XStack
          padding="$2"
          backgroundColor="$background"
          borderTopWidth={1}
          borderColor="$gray4"
        >
          <Input
            flex={1}
            size="$3"
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            onSubmitEditing={handleSend}
            returnKeyType="send"
            backgroundColor="$gray2"
            borderWidth={0}
            borderRadius="$3"
            padding="$2"
            disabled={isTyping}
            color="$color"
          />
          <Button
            size="$3"
            icon={Mic}
            marginLeft="$1"
            backgroundColor="$gray5"
            borderRadius="$3"
          />
          <Button
            size="$3"
            icon={File}
            marginLeft="$1"
            backgroundColor="$gray5"
            borderRadius="$3"
          />
          <Button
            size="$3"
            icon={Send}
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
            marginLeft="$1"
            backgroundColor="$blue10"
            borderRadius="$3"
          />
        </XStack>
      </YStack>
    </View>
  );
};