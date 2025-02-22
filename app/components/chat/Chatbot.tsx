import { useState, useEffect, useRef, useCallback, memo } from 'react';
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
  useTheme,
  Avatar,
  Sheet,
  Separator,
} from 'tamagui';
import { styled } from 'tamagui';
import { 
  Send, 
  File, 
  BotMessageSquare,
  Timer,
  PieChart,
  Percent,
  DollarSign,
  AlertTriangle,
  Paperclip,
  Info,
  Menu,
  Volume2,
  Camera,
  Mic,
  Bell,
} from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { chatbotApi, Message, QuickPrompt } from '@/api/chatbot';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';

interface ChatbotUIProps {
  initialMessage?: string;
  botName?: string;
  onConfirmGoal?: (goalData: Message['goalData']) => void;
  onConfirmAlert?: (alertData: Message['alertData']) => void;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  date: Date;
}

const MessageBubble = memo(({ message, onConfirmGoal, onEditGoal, onConfirmAlert, onEditAlert }: { 
  message: Message; 
  onConfirmGoal?: (goalData: Message['goalData']) => void;
  onEditGoal?: (goalData: Message['goalData']) => void;
  onConfirmAlert?: (alertData: Message['alertData']) => void;
  onEditAlert?: (alertData: Message['alertData']) => void;
}) => {
  const speakMessage = () => {
    if (message.sender === 'bot') {
      Speech.speak(message.text, { language: 'en' });
    }
  };

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
      
      <Card
        backgroundColor={
          message.type === 'goal' ? '#2F855A' :
          message.type === 'alert' ? '#D69E2E' :
          message.sender === 'user' ? '#333333' : '$blue9'
        }
        borderRadius={message.sender === 'user' ? '$6 $6 $2 $6' : '$6 $6 $6 $2'}
        padding="$3"
        maxWidth="80%"
        elevation={1}
      >
        <YStack space="$1">
          {message.type === 'goal' && message.goalData ? (
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
          ) : message.type === 'alert' && message.alertData ? (
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
          ) : (
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
          )}
          <XStack justifyContent="space-between" alignItems="center">
            <Text color="$gray4" fontSize="$1" opacity={0.7}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {message.sender === 'bot' && (
              <Button
                chromeless
                size="$2"
                icon={<Volume2 size={16} color="$gray10" />}
                onPress={speakMessage}
              />
            )}
          </XStack>
        </YStack>
      </Card>
    </XStack>
  );
});

const EventTypeIndicator = styled(XStack, {
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$2',
  marginBottom: '$2',
  alignItems: 'center',
  space: '$2',
  variants: {
    type: {
      info: { backgroundColor: '$blue5' },
    },
  } as const,
});

const EventCard = styled(Card, {
  borderRadius: '$4',
  padding: '$3',
  marginBottom: '$3',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  elevate: true,
  variants: {
    dark: {
      true: { backgroundColor: '$gray9', borderColor: '$gray5' },
      false: { backgroundColor: '$white', borderColor: '$gray3' },
    },
  } as const,
});

export const ChatbotUI = ({
  initialMessage = "Hello! I'm your AI assistant. How can I help you today?",
  botName = 'AI Assistant',
  onConfirmGoal,
  onConfirmAlert,
}: ChatbotUIProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const isDark = theme.name === 'dark';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [editingGoal, setEditingGoal] = useState<Message['goalData'] | null>(null);
  const [editingAlert, setEditingAlert] = useState<Message['alertData'] | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTitle, setToastTitle] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastBgColor, setToastBgColor] = useState<string>('$gray9');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { id: '1', title: 'Investment Options', date: new Date('2025-02-20') },
    { id: '2', title: 'Tax Questions', date: new Date('2025-02-19') },
  ]);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [showShowcase, setShowShowcase] = useState(true);
  const inputRef = useRef<Input>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickPrompts: QuickPrompt[] = [
    { text: "What are the current best investment opportunities in the Jamaican market for a conservative investor?", category: "investment", icon: PieChart },
    { text: "How can I create a diversified investment portfolio with JSE stocks and government bonds?", category: "planning", icon: PieChart },
    { text: "What are the tax implications of capital gains from JSE investments?", category: "tax", icon: DollarSign },
    { text: "What are the current interest rates and returns for Jamaican government bonds?", category: "market", icon: Percent },
    { text: "How can I protect my investments against inflation and currency fluctuations in Jamaica?", category: "risk", icon: AlertTriangle },
  ];

  useEffect(() => {
    if (!messages || messages.length === 0) { // Safeguard for undefined messages
      setMessages([
        { id: 'initial', text: initialMessage, sender: 'bot', timestamp: new Date(), status: 'sent', type: 'regular' },
      ]);
    }
  }, [initialMessage]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const toggleVoiceMode = () => {
    if (isVoiceModeActive) {
      setIsVoiceModeActive(false);
      Speech.stop();
    } else {
      setIsVoiceModeActive(true);
      inputRef.current?.focus();
      setToastTitle('Voice Mode');
      setToastMessage('Tap the mic on your keyboard to speak.');
      setToastBgColor('$blue9');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    }
  };

  const handleSend = useCallback(async () => {
    if (!input?.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      type: 'regular',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const botMessage = await chatbotApi.sendMessage(input.trim());
      setMessages((prev) =>
        prev
          .map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg))
          .concat(botMessage)
      );
      setChatHistory((prev) => [
        { id: userMessage.id, title: input.trim().slice(0, 20) + '...', date: new Date() },
        ...prev,
      ]);

      if (isVoiceModeActive) {
        Speech.speak(botMessage.text, {
          language: 'en',
          onDone: () => {
            if (isVoiceModeActive) {
              inputRef.current?.focus();
            }
          },
        });
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, something went wrong. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        status: 'error',
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
  }, [input, isTyping, isVoiceModeActive]);

  const handlePromptClick = useCallback(async (prompt: QuickPrompt) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: prompt.text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      type: 'regular',
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const botMessage = await chatbotApi.sendQuickPrompt(prompt);
      setMessages((prev) =>
        prev
          .map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg))
          .concat(botMessage)
      );
      setChatHistory((prev) => [
        { id: userMessage.id, title: prompt.text.slice(0, 20) + '...', date: new Date() },
        ...prev,
      ]);

      if (isVoiceModeActive) {
        Speech.speak(botMessage.text, {
          language: 'en',
          onDone: () => {
            if (isVoiceModeActive) {
              inputRef.current?.focus();
            }
          },
        });
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, something went wrong. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        status: 'error',
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
  }, [isVoiceModeActive]);

  const handleConfirmGoal = useCallback(async (goalData: Message['goalData']) => {
    setToastTitle('Goal Set');
    setToastMessage(`Goal "${goalData!.title}" has been set for $${goalData!.target} JMD by ${goalData!.timeframe}.`);
    setToastBgColor('$green9');
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
    onConfirmGoal?.(goalData);
    setMessages((prev) => [...prev]);
  }, [onConfirmGoal]);

  const handleConfirmAlert = useCallback(async (alertData: Message['alertData']) => {
    setToastTitle('Alert Set');
    setToastMessage(`${alertData!.type} alert set for ${alertData!.target} when ${alertData!.condition}.`);
    setToastBgColor('$yellow9');
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
    onConfirmAlert?.(alertData);
    setMessages((prev) => [...prev]);
  }, [onConfirmAlert]);

  const handleUpload = useCallback(async () => {
    setIsTyping(true);
    try {
      const botMessage = await chatbotApi.uploadAndAnalyzePdf();
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Sorry, I couldn’t process the PDF. Please ensure it’s a valid financial document and try again.',
        sender: 'bot',
        timestamp: new Date(),
        status: 'error',
        type: 'pdf-response',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleCaptureImage = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required to take pictures.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const imageUri = result.assets[0].uri;
      setIsTyping(true);

      try {
        const botMessage = await chatbotApi.processImage(imageUri, {
          focus: 'finance',
          types: ['receipt', 'payslip', 'invoice'],
        });
        setMessages((prev) => [...prev, botMessage]);
        setChatHistory((prev) => [
          { id: Date.now().toString(), title: 'Image Analysis', date: new Date() },
          ...prev,
        ]);
      } catch (error) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: 'Sorry, I couldn’t process the image. Please ensure it’s a clear finance-related document (e.g., receipt, payslip) and try again.',
          sender: 'bot',
          timestamp: new Date(),
          status: 'error',
          type: 'image-response',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  }, []);

  const messageList = useCallback(() => (
    <YStack space="$1">
      {(messages || []).map((message) => ( // Safeguard for undefined messages
        <MessageBubble 
          key={message.id} 
          message={message} 
          onConfirmGoal={handleConfirmGoal}
          onEditGoal={setEditingGoal}
          onConfirmAlert={handleConfirmAlert}
          onEditAlert={setEditingAlert}
        />
      ))}
      {isTyping && (
        <XStack paddingHorizontal="$2" paddingVertical="$1">
          <Card backgroundColor="$gray6" borderRadius="$4" padding="$2">
            <Spinner size="small" color="white" />
          </Card>
        </XStack>
      )}
    </YStack>
  ), [messages, isTyping, handleConfirmGoal, handleConfirmAlert]);

  return (
    <View flex={1} backgroundColor={isDark ? '$gray1Dark' : '$white'}>
      <YStack 
        flex={1} 
        // paddingTop={insets.top} 
        // paddingBottom={insets.bottom}
        animation="bouncy"
        enterStyle={{ opacity: 0, scale: 0.95, y: 20 }}
        exitStyle={{ opacity: 0, scale: 0.95, y: -20 }}
      >
        {toastVisible && (
          <Card
            position="absolute"
            top="$8"
            left="$2"
            right="$2"
            backgroundColor={toastBgColor}
            padding="$2"
            borderRadius="$6"
            elevation="$2"
            animation="quick"
            enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
            exitStyle={{ opacity: 0, scale: 1, y: -20 }}
            zIndex={1000}
          >
            <YStack alignItems="center" gap="$1">
              <Text color="white" fontWeight="bold" fontSize="$4">{toastTitle}</Text>
              <Text color="white" fontSize="$3">{toastMessage}</Text>
            </YStack>
          </Card>
        )}

        {showShowcase && (
          <XStack padding="$2" space="$2" animation="lazy" enterStyle={{ opacity: 0, y: -10 }} exitStyle={{ opacity: 0, y: -10 }}>
            <Button
              size="$2"
              borderRadius="$8"
              backgroundColor={isDark ? '$green9' : '$green2'}
              elevation={isDark ? 0 : 1}
              onPress={() => {
                setShowShowcase(false);
                setMessages((prev) => [
                  ...prev,
                  { id: Date.now().toString(), text: "You can set goals by chatting with me!", sender: 'bot', timestamp: new Date(), status: 'sent', type: 'regular' },
                ]);
              }}
              icon={<Timer size={16} color={isDark ? '$white' : '$green9'} />}
            >
              <Text fontSize="$3" color={isDark ? '$white' : '$green7'}>Set Goals</Text>
            </Button>
            <Button
              size="$2"
              borderRadius="$8"
              backgroundColor={isDark ? '$yellow9' : '$yellow2'}
              elevation={isDark ? 0 : 1}
              onPress={() => {
                setShowShowcase(false);
                setMessages((prev) => [
                  ...prev,
                  { id: Date.now().toString(), text: "You can set alerts for important events!", sender: 'bot', timestamp: new Date(), status: 'sent', type: 'regular' },
                ]);
              }}
              icon={<Bell size={16} color={isDark ? '$black' : '$yellow9'} />}
            >
              <Text fontSize="$3" color={isDark ? '$black' : '$yellow9'}>Set Alerts</Text>
            </Button>
            <Button
              size="$2"
              borderRadius="$8"
              backgroundColor={isDark ? '$gray9' : '$gray2'}
              elevation={isDark ? 0 : 1}
              onPress={() => {
                setShowShowcase(false);
                handleUpload();
              }}
              icon={<File size={16} color={isDark ? '$white' : '$gray9'} />}
            >
              <Text fontSize="$3" color={isDark ? '$white' : '$gray9'}>Upload Docs</Text>
            </Button>
          </XStack>
        )}

        {showDisclaimer && (
          <XStack padding="$2" animation="lazy" enterStyle={{ opacity: 0, y: -10 }}>
            <Card
              backgroundColor={theme.name === 'dark' ? '$gray3Dark' : '$gray1Light'}
              padding="$2"
              borderRadius="$4"
              flex={1}
              elevation={theme.name === 'light' ? 1 : 0}
            >
              <XStack space="$1" alignItems="center">
                <Info size={14} color="$red9" />
                <Text color={theme.name === 'dark' ? '$gray12' : '$gray11'} fontSize="$2">
                  The information provided is not financial advice.
                  <Button size="$2" chromeless color="$red9" onPress={() => setShowDisclaimer(false)}>
                    Dismiss
                  </Button>
                </Text>
              </XStack>
            </Card>
          </XStack>
        )}

        <ScrollView
          ref={scrollViewRef}
          flex={1}
          contentContainerStyle={{ paddingVertical: '$0', gap: '$1' }}
          showsVerticalScrollIndicator={false}
          backgroundColor={isDark ? '$gray1Dark' : '$white'}
        >
          {messageList()}
        </ScrollView>

        <YStack padding="$2" backgroundColor={isDark ? '$gray2Dark' : '$white'} elevation={isDark ? 0 : 1}>
          {!isInputFocused && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} marginBottom="$2">
              <XStack space="$1">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    size="$2"
                    borderRadius="$8"
                    backgroundColor={isDark ? '$gray3Dark' : '$gray1Light'}
                    elevation={isDark ? 0 : 1}
                    onPress={() => handlePromptClick(prompt)}
                    animation="lazy"
                    whileHover={{ backgroundColor: isDark ? '$gray4Dark' : '$gray2Light' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <XStack space="$1" alignItems="center">
                      <prompt.icon size={14} color={isDark ? '$gray12' : '$gray11'} />
                      <Text fontSize="$3" color={isDark ? '$gray12' : '$gray11'}>
                        {prompt.text}
                      </Text>
                    </XStack>
                  </Button>
                ))}
              </XStack>
            </ScrollView>
          )}

          <XStack alignItems="center" gap="$1">
            <Input
              ref={inputRef}
              flex={1}
              multiline
              maxHeight={80}
              value={input}
              onChangeText={setInput}
              placeholder={isVoiceModeActive ? 'Tap the mic on your keyboard...' : 'Message...'}
              backgroundColor={isDark ? '$gray3Dark' : '$white'}
              borderWidth={isDark ? 0 : 1}
              borderColor="$gray3Light"
              borderRadius="$4"
              padding="$2"
              disabled={isTyping}
              color={isDark ? '$gray12' : '$gray11'}
              placeholderTextColor="$gray4"
              fontSize={14}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onSubmitEditing={handleSend}
            />
            <Button
              size="$2"
              circular
              icon={<Mic size={18} color={isVoiceModeActive ? '$red9' : 'white'} />}
              onPress={toggleVoiceMode}
              backgroundColor={isVoiceModeActive ? '$gray9' : '$blue9'}
              disabled={isTyping}
            />
            <Button
              size="$2"
              circular
              icon={<Camera size={18} color={isTyping ? '$gray8' : 'white'} />}
              onPress={handleCaptureImage}
              disabled={isTyping}
              backgroundColor={isTyping ? 'transparent' : '$blue9'}
            />
            <Button
              size="$2"
              circular
              icon={<Paperclip size={18} color={isTyping ? '$gray8' : 'white'} />}
              onPress={handleUpload}
              disabled={isTyping}
              backgroundColor={isTyping ? 'transparent' : '$blue9'}
            />
            <Button
              size="$2"
              circular
              icon={<Send size={18} color={!input?.trim() || isTyping ? '$gray8' : 'white'} />}
              onPress={handleSend}
              disabled={!input?.trim() || isTyping}
              backgroundColor={!input?.trim() || isTyping ? 'transparent' : '$blue9'}
            />
          </XStack>
          
          <Text 
            fontSize="$2" 
            color={isDark ? '$gray9' : '$gray7'} 
            textAlign="center" 
            marginTop="$1"
          >
            <Info size={14} color="$red9" />
            {isVoiceModeActive ? 'Voice mode active - use keyboard mic' : 'AI Assistant may produce inaccurate information'}
          </Text>
        </YStack>
      </YStack>

      <Sheet
        open={!!editingGoal}
        onOpenChange={(open) => !open && setEditingGoal(null)}
        snapPoints={[50]}
        position={0}
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$2" backgroundColor={isDark ? '$gray1Dark' : '$white'} borderRadius="$4">
          <YStack space="$2">
            <Text fontSize="$5" fontWeight="bold" color={isDark ? '$gray12' : '$gray11'}>
              Edit Goal
            </Text>
            {editingGoal && (
              <>
                <XStack space="$2" alignItems="center">
                  <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Title</Text>
                  <Input
                    flex={3}
                    value={editingGoal.title}
                    onChangeText={(text) => setEditingGoal({ ...editingGoal, title: text })}
                    backgroundColor={isDark ? '$gray3Dark' : '$white'}
                    borderColor="$gray3Light"
                    borderRadius="$3"
                    padding="$2"
                    color={isDark ? '$gray12' : '$gray11'}
                  />
                </XStack>
                <XStack space="$2" alignItems="center">
                  <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Target (JMD)</Text>
                  <Input
                    flex={3}
                    value={editingGoal.target.toString()}
                    onChangeText={(text) => setEditingGoal({ ...editingGoal, target: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                    backgroundColor={isDark ? '$gray3Dark' : '$white'}
                    borderColor="$gray3Light"
                    borderRadius="$3"
                    padding="$2"
                    color={isDark ? '$gray12' : '$gray11'}
                  />
                </XStack>
                <XStack space="$2" alignItems="center">
                  <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Timeframe</Text>
                  <Input
                    flex={3}
                    value={editingGoal.timeframe}
                    onChangeText={(text) => setEditingGoal({ ...editingGoal, timeframe: text })}
                    backgroundColor={isDark ? '$gray3Dark' : '$white'}
                    borderColor="$gray3Light"
                    borderRadius="$3"
                    padding="$2"
                    color={isDark ? '$gray12' : '$gray11'}
                  />
                </XStack>
                <XStack space="$2" alignItems="center">
                  <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Description</Text>
                  <Input
                    flex={3}
                    value={editingGoal.description || ''}
                    onChangeText={(text) => setEditingGoal({ ...editingGoal, description: text })}
                    multiline
                    backgroundColor={isDark ? '$gray3Dark' : '$white'}
                    borderColor="$gray3Light"
                    borderRadius="$3"
                    padding="$2"
                    color={isDark ? '$gray12' : '$gray11'}
                  />
                </XStack>
                <XStack justifyContent="flex-end" space="$1" marginTop="$2">
                  <Button 
                    size="$3"
                    onPress={() => setEditingGoal(null)} 
                    backgroundColor={isDark ? '$gray3Dark' : '$gray2Light'} 
                    color={isDark ? '$gray12' : '$gray11'}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="$3"
                    backgroundColor="$green9"
                    onPress={() => {
                      handleConfirmGoal(editingGoal);
                      setEditingGoal(null);
                    }}
                  >
                    Save
                  </Button>
                </XStack>
              </>
            )}
          </YStack>
        </Sheet.Frame>
      </Sheet>

      <Sheet
        open={!!editingAlert}
        onOpenChange={(open) => !open && setEditingAlert(null)}
        snapPoints={[50]}
        position={0}
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$2" backgroundColor={isDark ? '$gray1Dark' : '$white'} borderRadius="$4">
          <YStack space="$2">
            <Text fontSize="$5" fontWeight="bold" color={isDark ? '$gray12' : '$gray11'}>
              Edit Alert
            </Text>
            {editingAlert && (
              <>
                <XStack space="$2" alignItems="center">
                  <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Type</Text>
                  <Input
                    flex={3}
                    value={editingAlert.type}
                    onChangeText={(text) => setEditingAlert({ ...editingAlert, type: text as any })}
                    backgroundColor={isDark ? '$gray3Dark' : '$white'}
                    borderColor="$gray3Light"
                    borderRadius="$3"
                    padding="$2"
                    color={isDark ? '$gray12' : '$gray11'}
                  />
                </XStack>
                <XStack space="$2" alignItems="center">
                  <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Target</Text>
                  <Input
                    flex={3}
                    value={editingAlert.target}
                    onChangeText={(text) => setEditingAlert({ ...editingAlert, target: text })}
                    backgroundColor={isDark ? '$gray3Dark' : '$white'}
                    borderColor="$gray3Light"
                    borderRadius="$3"
                    padding="$2"
                    color={isDark ? '$gray12' : '$gray11'}
                  />
                </XStack>
                <XStack space="$2" alignItems="center">
                  <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Condition</Text>
                  <Input
                    flex={3}
                    value={editingAlert.condition}
                    onChangeText={(text) => setEditingAlert({ ...editingAlert, condition: text })}
                    backgroundColor={isDark ? '$gray3Dark' : '$white'}
                    borderColor="$gray3Light"
                    borderRadius="$3"
                    padding="$2"
                    color={isDark ? '$gray12' : '$gray11'}
                  />
                </XStack>
                <YStack space="$1">
                  <Text color={isDark ? '$gray11' : '$gray10'}>Notify Via</Text>
                  <XStack space="$1" flexWrap="wrap">
                    {['email', 'sms', 'push', 'in-app'].map((method) => (
                      <Button
                        key={method}
                        size="$2"
                        backgroundColor={editingAlert.notificationMethod.includes(method) ? '$yellow9' : '$gray3'}
                        onPress={() => {
                          const updatedMethods = editingAlert.notificationMethod.includes(method)
                            ? editingAlert.notificationMethod.filter(m => m !== method)
                            : [...editingAlert.notificationMethod, method];
                          setEditingAlert({ ...editingAlert, notificationMethod: updatedMethods });
                        }}
                        color={editingAlert.notificationMethod.includes(method) ? 'white' : isDark ? '$gray12' : '$gray11'}
                      >
                        {method}
                      </Button>
                    ))}
                  </XStack>
                </YStack>
                <XStack justifyContent="flex-end" space="$1" marginTop="$2">
                  <Button 
                    size="$3"
                    onPress={() => setEditingAlert(null)} 
                    backgroundColor={isDark ? '$gray3Dark' : '$gray2Light'} 
                    color={isDark ? '$gray12' : '$gray11'}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="$3"
                    backgroundColor="$yellow9"
                    onPress={() => {
                      handleConfirmAlert(editingAlert);
                      setEditingAlert(null);
                    }}
                  >
                    Save
                  </Button>
                </XStack>
              </>
            )}
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </View>
  );
};