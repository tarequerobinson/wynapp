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
import { Platform } from 'react-native';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  type?: 'regular' | 'pdf-upload' | 'pdf-response' | 'goal' | 'alert';
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
  initialMessage = 'Hello! I’m your Financial Assistant powered by Gemini. How can I assist you today?',
  botName = 'Financial Assistant',
}: ChatbotProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>(''); // Explicitly typed as string
  const [isTyping, setIsTyping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfContext, setPdfContext] = useState<{ fileName: string; summary: string; topics: string[] } | null>(null);
  const [editingGoal, setEditingGoal] = useState<Message['goalData'] | null>(null);
  const [editingAlert, setEditingAlert] = useState<Message['alertData'] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDark, setIsDark] = useState(theme.name === 'dark');
  const [showPinned, setShowPinned] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Gemini API setup
  const API_KEY = ''; // Replace with your actual Gemini API key
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
    { text: 'What are top investment options for 2025?', icon: <BotMessageSquare size={16} /> },
    { text: 'How do I diversify my portfolio?', icon: <BotMessageSquare size={16} /> },
    { text: 'Explain market trends today', icon: <BotMessageSquare size={16} /> },
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
      const result = await model.generateContent(input); // Use input directly
      const responseText = result.response.text();

      // Parse response for structured data (goal or alert)
      const parsedResponse = parseResponse(responseText);

      let botMessage: Message;
      if (parsedResponse.type === 'goal') {
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: parsedResponse.text,
          sender: 'bot',
          timestamp: new Date(),
          status: 'sent',
          type: 'goal',
          goalData: parsedResponse.goal,
        };
      } else if (parsedResponse.type === 'alert') {
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: parsedResponse.text,
          sender: 'bot',
          timestamp: new Date(),
          status: 'sent',
          type: 'alert',
          alertData: parsedResponse.alert,
        };
      } else {
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          sender: 'bot',
          timestamp: new Date(),
          status: 'sent',
          type: 'regular',
        };
      }

      setMessages((prev) =>
        prev
          .map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg))
          .concat(botMessage)
      );
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while processing your request. Please try again.',
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

  const handleRetry = (text: string) => {
    setInput(text);
    handleSend();
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    handleSend();
  };

  // Function to confirm a goal
  const handleConfirmGoal = async (goalData: Message['goalData']) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) throw new Error('Failed to save goal');

      const confirmMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Your goal "${goalData!.title}" has been saved successfully. We'll help track your progress towards reaching $${goalData!.target} by ${goalData!.timeframe}.`,
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
        type: 'regular',
      };
      setMessages((prev) => [...prev, confirmMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I couldn’t save your goal. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
        type: 'regular',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Function to confirm an alert
  const handleConfirmAlert = async (alertData: Message['alertData']) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });

      if (!response.ok) throw new Error('Failed to save alert');

      const confirmMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Your ${alertData!.type} alert has been set. You'll be notified via ${alertData!.notificationMethod.join(', ')} when ${alertData!.target} ${alertData!.condition}.`,
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
        type: 'regular',
      };
      setMessages((prev) => [...prev, confirmMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I couldn’t save your alert. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
        type: 'regular',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => (
    <AnimatePresence>
      <XStack
        animation="bouncy"
        enterStyle={{ opacity: 0, scale: 0.9, y: 20 }}
        exitStyle={{ opacity: 0, scale: 0.9 }}
        justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
        paddingHorizontal="$4"
        paddingVertical="$2"
      >
        <Card
          elevate
          elevation="$2" // Consistent shadow with Tamagui elevation
          bordered
          borderColor={message.sender === 'user' ? '$blue8' : '$gray5'}
          backgroundColor={message.sender === 'user' ? '$blue10' : '$gray3'}
          borderRadius="$6"
          padding="$3"
          maxWidth="80%"
          hoverStyle={{ scale: 1.02 }}
        >
          {message.type === 'goal' && message.goalData ? (
            <YStack>
              <Text color="$emerald10" fontWeight="bold">
                Goal: {message.goalData.title}
              </Text>
              <Text color={message.sender === 'user' ? '$white' : '$color'}>{message.text}</Text>
              <Text color="$gray9">
                Target: ${message.goalData.target} by {message.goalData.timeframe}
              </Text>
              {message.goalData.description && (
                <Text color="$gray9">Description: {message.goalData.description}</Text>
              )}
              <XStack space="$2" mt="$2">
                <Button size="$2" onPress={() => setEditingGoal(message.goalData)}>
                  Edit
                </Button>
                <Button size="$2" onPress={() => handleConfirmGoal(message.goalData!)}>
                  Confirm
                </Button>
              </XStack>
            </YStack>
          ) : message.type === 'alert' && message.alertData ? (
            <YStack>
              <Text color="$amber10" fontWeight="bold">
                {message.alertData.type.charAt(0).toUpperCase() + message.alertData.type.slice(1)} Alert
              </Text>
              <Text color={message.sender === 'user' ? '$white' : '$color'}>{message.text}</Text>
              <Text color="$gray9">
                When: {message.alertData.target} {message.alertData.condition}
              </Text>
              <Text color="$gray9">Notify via: {message.alertData.notificationMethod.join(', ')}</Text>
              <XStack space="$2" mt="$2">
                <Button size="$2" onPress={() => setEditingAlert(message.alertData)}>
                  Edit
                </Button>
                <Button size="$2" onPress={() => handleConfirmAlert(message.alertData!)}>
                  Confirm
                </Button>
              </XStack>
            </YStack>
          ) : (
            <YStack>
              <Markdown
                style={{
                  body: {
                    color: message.sender === 'user' ? theme.white?.val : theme.color?.val,
                    fontSize: 16,
                  },
                  paragraph: { marginVertical: 4 },
                  strong: { fontWeight: 'bold' },
                  em: { fontStyle: 'italic' },
                }}
              >
                {message.text}
              </Markdown>
              <XStack justifyContent="space-between" alignItems="center" mt="$1">
                <Text
                  color={message.sender === 'user' ? '$blue2' : '$gray9'}
                  fontSize="$2"
                  opacity={0.7}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <XStack space="$1">
                  <Button
                    size="$2"
                    chromeless
                    icon={<File size={12} />}
                    onPress={() => navigator.clipboard.writeText(message.text)} // Replace with Clipboard for RN
                  >
                    Copy
                  </Button>
                  {message.status === 'error' && (
                    <Button
                      size="$2"
                      chromeless
                      color="$red10"
                      onPress={() => handleRetry(message.text)}
                    >
                      Retry
                    </Button>
                  )}
                </XStack>
              </XStack>
              {message.status === 'sending' && <Spinner size="small" color="$gray10" mt="$1" />}
              {message.status === 'error' && <Text color="$red10" fontSize="$2" mt="$1">Failed</Text>}
            </YStack>
          )}
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
        {...(isFullscreen ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 } : {})}
      >
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" padding="$3">
          <Text color="$white" fontWeight="bold">{botName}</Text>
          <XStack space="$2">
            <Button
              size="$3"
              circular
              icon={isDark ? Sun : Moon}
              onPress={() => {
                setIsDark(!isDark);
                // Implement theme switching logic here
              }}
            />
            <Button
              size="$3"
              circular
              icon={isFullscreen ? Minimize2 : Maximize2}
              onPress={() => setIsFullscreen(!isFullscreen)}
            />
            <Button size="$3" circular icon={X} onPress={onClose} />
          </XStack>
        </XStack>

        {/* Pinned Goals/Alerts Section */}
        <XStack paddingHorizontal="$3" paddingVertical="$2">
          <Button size="$3" onPress={() => setShowPinned(!showPinned)}>
            {showPinned ? 'Hide Pinned' : 'Show Pinned'}
          </Button>
        </XStack>
        {showPinned && (
          <YStack padding="$3" backgroundColor="$gray2" borderRadius="$4" marginHorizontal="$3">
            <Text fontWeight="bold" color="$color">Pinned Goals & Alerts</Text>
            {messages.filter((msg) => msg.type === 'goal' || msg.type === 'alert').length > 0 ? (
              messages
                .filter((msg) => msg.type === 'goal' || msg.type === 'alert')
                .map((msg) => (
                  <Text key={msg.id} color="$color">
                    {msg.type === 'goal' ? `Goal: ${msg.goalData?.title}` : `Alert: ${msg.alertData?.target}`}
                  </Text>
                ))
            ) : (
              <Text color="$gray9">No goals or alerts pinned yet.</Text>
            )}
          </YStack>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          flex={1}
          contentContainerStyle={{ paddingVertical: 20, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <YStack space="$2">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && (
              <XStack paddingHorizontal="$4" paddingVertical="$2" animation="bouncy" enterStyle={{ opacity: 0, scale: 0.8 }}>
                <Card elevate elevation="$1" backgroundColor="$gray3" borderRadius="$5" padding="$2">
                  <XStack space="$2" alignItems="center">
                    <Spinner size="small" color="$gray10" />
                    <Text color="$gray11" fontSize="$3">
                      {botName} is typing
                      <Text color="$gray11" animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }}>
                        {['.', '..', '...'][Math.floor(Date.now() / 500) % 3]}
                      </Text>
                    </Text>
                  </XStack>
                </Card>
              </XStack>
            )}
          </YStack>
        </ScrollView>

        {/* Quick Prompts */}
        <XStack padding="$3" space="$2" overflow="scroll">
          {quickPrompts.map((prompt, idx) => (
            <Button
              key={idx}
              size="$3"
              backgroundColor="$gray3"
              borderRadius="$4"
              onPress={() => handlePromptClick(prompt.text)}
              animation="quick"
              hoverStyle={{ backgroundColor: '$gray4' }}
            >
              <XStack space="$1" alignItems="center">
                {prompt.icon}
                <Text fontSize="$3" color="$color">{prompt.text}</Text>
              </XStack>
            </Button>
          ))}
        </XStack>

        {/* Input Area */}
        <XStack
          position="absolute"
          bottom={insets.bottom}
          left={0}
          right={0}
          padding="$3"
          backgroundColor="$background"
          borderTopWidth={1}
          borderColor="$gray4"
          elevation={2}
          zIndex={10}
        >
          <Input
            flex={1}
            size="$4"
            value={input}
            onChangeText={(text) => {
              setInput(text || '');
              setShowSuggestions(text.length > 0);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Type a message..."
            onSubmitEditing={handleSend}
            returnKeyType="send"
            autoCapitalize="sentences"
            backgroundColor="$gray2"
            borderWidth={0}
            borderRadius="$4"
            paddingHorizontal="$3"
            paddingVertical="$2"
            disabled={isTyping}
            color="$color"
          />
          <Button
            size="$4"
            icon={Mic}
            onPress={() => console.log('Voice input placeholder - implement voice recognition')}
            marginLeft="$2"
            backgroundColor="$gray5"
            borderRadius="$4"
          />
          <Button
            size="$4"
            icon={File}
            onPress={() => console.log('PDF upload placeholder')}
            marginLeft="$2"
            backgroundColor="$gray5"
            borderRadius="$4"
          />
          <Button
            size="$4"
            icon={Send}
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
            marginLeft="$2"
            backgroundColor="$blue10"
            borderRadius="$4"
          />
        </XStack>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <YStack
            position="absolute"
            bottom={insets.bottom + 60}
            left="$3"
            right="$3"
            backgroundColor="$gray2"
            borderRadius="$4"
            padding="$2"
            zIndex={20}
            elevation="$1"
          >
            {['Check my portfolio', 'Set a savings goal', 'Latest market news'].map((suggestion) => (
              <Button
                key={suggestion}
                chromeless
                onPress={() => handleSuggestion(suggestion)}
              >
                <Text color="$color">{suggestion}</Text>
              </Button>
            ))}
          </YStack>
        )}

        {/* Goal Editing Sheet */}
        <Sheet open={!!editingGoal} onOpenChange={() => setEditingGoal(null)} modal snapPoints={[90]}>
          <Sheet.Overlay />
          <Sheet.Frame padding="$4" backgroundColor="$background">
            <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
              Edit Goal
            </Text>
            <YStack space="$3">
              <YStack>
                <Label>Goal Title</Label>
                <Input
                  value={editingGoal?.title}
                  onChangeText={(text) => setEditingGoal((prev) => ({ ...prev!, title: text }))}
                  placeholder="Enter goal title"
                />
              </YStack>
              <YStack>
                <Label>Target Amount</Label>
                <Input
                  value={editingGoal?.target.toString()}
                  onChangeText={(text) => setEditingGoal((prev) => ({ ...prev!, target: parseFloat(text) || 0 }))}
                  placeholder="Enter target amount"
                  keyboardType="numeric"
                />
              </YStack>
              <YStack>
                <Label>Timeframe</Label>
                <Input
                  value={editingGoal?.timeframe}
                  onChangeText={(text) => setEditingGoal((prev) => ({ ...prev!, timeframe: text }))}
                  placeholder="Enter timeframe"
                />
              </YStack>
              <YStack>
                <Label>Description (Optional)</Label>
                <Input
                  value={editingGoal?.description || ''}
                  onChangeText={(text) => setEditingGoal((prev) => ({ ...prev!, description: text }))}
                  placeholder="Enter description"
                />
              </YStack>
              <XStack space="$2" justifyContent="flex-end">
                <Button onPress={() => setEditingGoal(null)}>Cancel</Button>
                <Button
                  onPress={() => {
                    handleConfirmGoal(editingGoal!);
                    setEditingGoal(null);
                  }}
                  backgroundColor="$blue10"
                >
                  Save Changes
                </Button>
              </XStack>
            </YStack>
          </Sheet.Frame>
        </Sheet>

        {/* Alert Editing Sheet */}
        <Sheet open={!!editingAlert} onOpenChange={() => setEditingAlert(null)} modal snapPoints={[90]}>
          <Sheet.Overlay />
          <Sheet.Frame padding="$4" backgroundColor="$background">
            <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
              Edit Alert
            </Text>
            <YStack space="$3">
              <YStack>
                <Label>Alert Type</Label>
                <Input
                  value={editingAlert?.type}
                  onChangeText={(text) => setEditingAlert((prev) => ({ ...prev!, type: text as any }))}
                  placeholder="Enter alert type (price, market, news)"
                />
              </YStack>
              <YStack>
                <Label>Target</Label>
                <Input
                  value={editingAlert?.target}
                  onChangeText={(text) => setEditingAlert((prev) => ({ ...prev!, target: text }))}
                  placeholder="Enter target"
                />
              </YStack>
              <YStack>
                <Label>Condition</Label>
                <Input
                  value={editingAlert?.condition}
                  onChangeText={(text) => setEditingAlert((prev) => ({ ...prev!, condition: text }))}
                  placeholder="Enter condition"
                />
              </YStack>
              <YStack>
                <Label>Notification Methods (comma-separated)</Label>
                <Input
                  value={editingAlert?.notificationMethod.join(', ')}
                  onChangeText={(text) =>
                    setEditingAlert((prev) => ({ ...prev!, notificationMethod: text.split(', ').filter(Boolean) }))
                  }
                  placeholder="e.g., email, sms, push"
                />
              </YStack>
              <XStack space="$2" justifyContent="flex-end">
                <Button onPress={() => setEditingAlert(null)}>Cancel</Button>
                <Button
                  onPress={() => {
                    handleConfirmAlert(editingAlert!);
                    setEditingAlert(null);
                  }}
                  backgroundColor="$blue10"
                >
                  Save Changes
                </Button>
              </XStack>
            </YStack>
          </Sheet.Frame>
        </Sheet>
      </YStack>
    </View>
  );
};

// Helper function to parse Gemini response for structured data
function parseResponse(text: string) {
  if (text.includes('GOAL:') || (text.includes('financial goal') && text.includes('target'))) {
    try {
      const title =
        text.match(/title[:=]\s*(.*?)(?:\n|$)/i)?.[1]?.trim() ||
        text.match(/(?:saving|investment|financial) goal[:\s]+(.*?)(?:\n|$)/i)?.[1]?.trim() ||
        'Financial Goal';
      const targetMatch = text.match(/(?:target|amount)[:\s]+\$?([\d,]+)/i);
      const target = targetMatch ? parseInt(targetMatch[1].replace(/,/g, '')) : 100000;
      const timeframeMatch = text.match(
        /(?:timeframe|by|within|in)[:\s]+((?:\d+\s+(?:years?|months?)|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}))/i
      );
      const timeframe = timeframeMatch ? timeframeMatch[1].trim() : '1 year';
      const descriptionMatch = text.match(/description[:=]\s*(.*?)(?:\n\n|\n(?=[A-Z])|\n$|$)/is);
      const description = descriptionMatch ? descriptionMatch[1].trim() : undefined;

      return {
        type: 'goal',
        text,
        goal: { title, target, timeframe, description },
      };
    } catch (error) {
      console.error('Error parsing goal data:', error);
    }
  }

  if (text.includes('ALERT:') || text.includes('market alert') || text.includes('price alert')) {
    try {
      const typeMatch = text.match(/(?:alert type|type)[:=]\s*(price|market|news)/i);
      const type = typeMatch ? typeMatch[1].toLowerCase() : 'price';
      const targetMatch = text.match(/(?:target|for)[:=]\s*(.*?)(?:\n|when|\s+if)/i);
      const target = targetMatch ? targetMatch[1].trim() : 'JSE Index';
      const conditionMatch = text.match(/(?:condition|when|if)[:=]\s*(.*?)(?:\n|notify|$)/i);
      const condition = conditionMatch ? conditionMatch[1].trim() : 'changes significantly';
      const notificationMethodMatch = text.match(/(?:notify via|notification method|send)[:=]\s*(.*?)(?:\n|$)/i);
      const notificationMethodText = notificationMethodMatch ? notificationMethodMatch[1].trim() : 'email, push';
      const notificationMethod = notificationMethodText
        .split(/[,\s]+/)
        .filter((method) => ['email', 'sms', 'push', 'in-app'].includes(method.toLowerCase()));

      return {
        type: 'alert',
        text,
        alert: {
          type,
          target,
          condition,
          notificationMethod: notificationMethod.length ? notificationMethod : ['email', 'push'],
        },
      };
    } catch (error) {
      console.error('Error parsing alert data:', error);
    }
  }

  return { type: 'regular', text };
}