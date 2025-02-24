import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Animated, RefreshControl } from 'react-native';
import {
  YStack,
  XStack,
  ScrollView,
  Button,
  Text,
  Card,
  Spinner,
  useTheme,
  styled,
  Input,
} from 'tamagui';
import {
  Timer,
  Bell,
  File,
  Info,
  PieChart,
  Percent,
  DollarSign,
  AlertTriangle,
  Search,
  Share2,
  Bookmark,
  ChevronDown,
  Volume2,
  VolumeX,
} from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatbotApi, QuickPrompt } from '@/api/chatbot';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Share } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput2';
import { QuickPrompts } from './QuickPrompts';
import { ToastNotification } from './ToastNotification';
import { GoalEditorSheet } from './GoalEditorSheet';
import { AlertEditorSheet } from './AlertEditorSheet';
import { ChatbotUIProps, Message, ChatHistoryItem } from './types';

// Styled Components
const ChatContainer = styled(YStack, {
  name: 'ChatContainer',
  flex: 1,
  backgroundColor: '$background',
  variants: {
    dark: {
      true: { backgroundColor: '$gray1Dark' },
    },
  },
});

const ChatScrollView = styled(ScrollView, {
  name: 'ChatScrollView',
  backgroundColor: '$background',
  variants: {
    dark: {
      true: { backgroundColor: '$gray1Dark' },
    },
  },
});

const ShowcaseContainer = styled(XStack, {
  name: 'ShowcaseContainer',
  padding: '$1', // Smaller padding than before
  space: '$1', // Tighter spacing between buttons
  flexWrap: 'wrap', // Allows buttons to wrap to the next line if needed
  justifyContent: 'center', // Centers buttons horizontally
  backgroundColor: '$gray2',
  variants: {
    dark: {
      true: { backgroundColor: '$gray3Dark' },
    },
  },
});

const DisclaimerCard = styled(Card, {
  name: 'DisclaimerCard',
  backgroundColor: '$gray1Light',
  padding: '$2',
  borderRadius: '$4',
  flex: 1,
  elevation: '$1',
  variants: {
    dark: {
      true: { 
        backgroundColor: '$gray3Dark',
        elevation: 0,
      },
    },
  },
});

const MessageContainer = styled(YStack, {
  name: 'MessageContainer',
  space: '$1',
  variants: {
    dark: {
      true: { backgroundColor: '$gray1Dark' },
    },
  },
});

const StyledButton = styled(Button, {
  name: 'StyledButton',
  borderRadius: '$3', // Smaller, tighter corners
  paddingHorizontal: '$2', // Reduced padding for compactness
  paddingVertical: '$1',
  justifyContent: 'center', // Center icon and text
  pressStyle: { opacity: 0.85 },
  variants: {
    variant: {
      green: {
        backgroundColor: '$green3Light',
        borderColor: '$green7',
        borderWidth: 1,
        hoverStyle: { backgroundColor: '$green4Light' },
      },
      yellow: {
        backgroundColor: '$yellow3Light',
        borderColor: '$yellow7',
        borderWidth: 1,
        hoverStyle: { backgroundColor: '$yellow4Light' },
      },
      gray: {
        backgroundColor: '$gray3Light',
        borderColor: '$gray7',
        borderWidth: 1,
        hoverStyle: { backgroundColor: '$gray4Light' },
      },
    },
    dark: {
      true: {
        variant: {
          green: {
            backgroundColor: '$green3Dark',
            borderColor: '$green9',
            hoverStyle: { backgroundColor: '$green4Dark' },
          },
          yellow: {
            backgroundColor: '$yellow3Dark',
            borderColor: '$yellow9',
            hoverStyle: { backgroundColor: '$yellow4Dark' },
          },
          gray: {
            backgroundColor: '$gray3Dark',
            borderColor: '$gray9',
            hoverStyle: { backgroundColor: '$gray4Dark' },
          },
        },
      },
    },
  } as const,
});

const TypingIndicator = styled(XStack, {
  name: 'TypingIndicator',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  variants: {
    dark: {
      true: {
        backgroundColor: '$gray3Dark',
      },
    },
  },
});

export const ChatbotUI = memo(({
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
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [showShowcase, setShowShowcase] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { id: '1', title: 'Investment Options', date: new Date('2025-02-20') },
    { id: '2', title: 'Tax Questions', date: new Date('2025-02-19') },
  ]);

  const inputRef = useRef<Input>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const quickPrompts: QuickPrompt[] = [
    { text: "What are the current best investment opportunities in the Jamaican market for a conservative investor?", category: "investment", icon: PieChart },
    { text: "How can I create a diversified investment portfolio with JSE stocks and government bonds?", category: "planning", icon: PieChart },
    { text: "What are the tax implications of capital gains from JSE investments?", category: "tax", icon: DollarSign },
    { text: "What are the current interest rates and returns for Jamaican government bonds?", category: "market", icon: Percent },
    { text: "How can I protect my investments against inflation and currency fluctuations in Jamaica?", category: "risk", icon: AlertTriangle },
  ];

  useEffect(() => {
    if (!messages.length) {
      setMessages([
        { id: 'initial', text: initialMessage, sender: 'bot', timestamp: new Date(), status: 'sent', type: 'regular' },
      ]);
    }
  }, [initialMessage, messages.length]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const toggleVoiceMode = useCallback(() => {
    if (isVoiceModeActive) {
      setIsVoiceModeActive(false);
      Speech.stop();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setIsVoiceModeActive(true);
      inputRef.current?.focus();
      setToastTitle('Voice Mode');
      setToastMessage('Tap the mic on your keyboard to speak.');
      setToastBgColor('$blue9');
      setToastVisible(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(() => setToastVisible(false), 3000);
    }
  }, [isVoiceModeActive]);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsTyping(false);
    }
  }, [isVoiceModeActive]);

  const handleConfirmGoal = useCallback(async (goalData: Message['goalData']) => {
    setToastTitle('Goal Set');
    setToastMessage(`Goal "${goalData!.title}" has been set for $${goalData!.target} JMD by ${goalData!.timeframe}.`);
    setToastBgColor('$green9');
    setToastVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
    setTimeout(() => setToastVisible(false), 3000);
    onConfirmGoal?.(goalData);
    setMessages((prev) => [...prev]);
  }, [onConfirmGoal]);

  const handleConfirmAlert = useCallback(async (alertData: Message['alertData']) => {
    setToastTitle('Alert Set');
    setToastMessage(`${alertData!.type} alert set for ${alertData!.target} when ${alertData!.condition}.`);
    setToastBgColor('$yellow9');
    setToastVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
    setTimeout(() => setToastVisible(false), 3000);
    onConfirmAlert?.(alertData);
    setMessages((prev) => [...prev]);
  }, [onConfirmAlert]);

  const handleUpload = useCallback(async () => {
    setIsTyping(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const botMessage = await chatbotApi.uploadAndAnalyzePdf();
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Sorry, I could not process the PDF. Please ensure it is a valid financial document and try again.',
        sender: 'bot',
        timestamp: new Date(),
        status: 'error',
        type: 'pdf-response',
      };
      setMessages((prev) => [...prev, errorMessage]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
          text: 'Sorry, I could not process the image. Please ensure it is a clear finance-related document (e.g., receipt, payslip) and try again.',
          sender: 'bot',
          timestamp: new Date(),
          status: 'error',
          type: 'image-response',
        };
        setMessages((prev) => [...prev, errorMessage]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsTyping(false);
      }
    }
  }, []);

  const messageList = useCallback(() => (
    <MessageContainer dark={isDark}>
      {(messages || []).map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          onConfirmGoal={handleConfirmGoal}
          onEditGoal={setEditingGoal}
          onConfirmAlert={handleConfirmAlert}
          onEditAlert={setEditingAlert}
          dark={isDark}
        />
      ))}
      {isTyping && (
        <TypingIndicator dark={isDark}>
          <Card backgroundColor={isDark ? '$gray6Dark' : '$gray6'} borderRadius="$4" padding="$2">
            <Spinner size="small" color={isDark ? '$gray12' : 'white'} />
          </Card>
        </TypingIndicator>
      )}
    </MessageContainer>
  ), [messages, isTyping, handleConfirmGoal, handleConfirmAlert, isDark]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <ChatContainer dark={isDark}>
      <ToastNotification 
        visible={toastVisible}
        title={toastTitle}
        message={toastMessage}
        bgColor={toastBgColor}
        dark={isDark}
      />

      {showShowcase && (
        <ShowcaseContainer dark={isDark}>
          <StyledButton
            size="$2" // Back to original small size
            variant="green"
            dark={isDark}
            onPress={() => {
              setShowShowcase(false);
              setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), text: "You can set goals by chatting with me!", sender: 'bot', timestamp: new Date(), status: 'sent', type: 'regular' },
              ]);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            icon={<Timer size={14} color={isDark ? '$green9' : '$green7'} />} // Smaller icon
          >
            <Text fontSize="$2" color={isDark ? '$green9' : '$green7'}>Goals</Text> {/* Shortened text */}
          </StyledButton>

          <StyledButton
            size="$2"
            variant="yellow"
            dark={isDark}
            onPress={() => {
              setShowShowcase(false);
              setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), text: "You can set alerts for important events!", sender: 'bot', timestamp: new Date(), status: 'sent', type: 'regular' },
              ]);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            icon={<Bell size={14} color={isDark ? '$yellow9' : '$yellow7'} />}
          >
            <Text fontSize="$2" color={isDark ? '$yellow9' : '$yellow7'}>Alerts</Text> {/* Shortened text */}
          </StyledButton>

          <StyledButton
            size="$2"
            variant="gray"
            dark={isDark}
            onPress={() => {
              setShowShowcase(false);
              handleUpload();
            }}
            icon={<File size={14} color={isDark ? '$gray9' : '$gray7'} />}
          >
            <Text fontSize="$2" color={isDark ? '$gray9' : '$gray7'}>Docs</Text> {/* Shortened text */}
          </StyledButton>
        </ShowcaseContainer>
      )}

      {showDisclaimer && (
        <XStack padding="$2">
          <DisclaimerCard dark={isDark}>
            <XStack space="$1" alignItems="center">
              <Info size={14} color="$red9" />
              <Text color={isDark ? '$gray12' : '$gray11'} fontSize="$2">
                The information provided is not financial advice.
                <Button 
                  size="$2" 
                  chromeless 
                  color="$red9" 
                  onPress={() => {
                    setShowDisclaimer(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  Dismiss
                </Button>
              </Text>
            </XStack>
          </DisclaimerCard>
        </XStack>
      )}

      <ChatScrollView
        ref={scrollViewRef}
        dark={isDark}
        flex={1}
        contentContainerStyle={{ paddingVertical: '$0', gap: '$1' }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '$gray12' : '$gray11'}
          />
        }
      >
        {messageList()}
      </ChatScrollView>

      {!isInputFocused && (
        <QuickPrompts 
          prompts={quickPrompts}
          onPromptClick={handlePromptClick}
          isDark={isDark}
        />
      )}

      <ChatInput
        input={input}
        isTyping={isTyping}
        isVoiceModeActive={isVoiceModeActive}
        onInputChange={setInput}
        onSend={handleSend}
        onToggleVoiceMode={toggleVoiceMode}
        onCaptureImage={handleCaptureImage}
        onUpload={handleUpload}
        isDark={isDark}
        inputRef={inputRef}
        isInputFocused={isInputFocused}
        setIsInputFocused={setIsInputFocused}
      />

      <GoalEditorSheet
        goal={editingGoal}
        onClose={() => setEditingGoal(null)}
        onSave={handleConfirmGoal}
        isDark={isDark}
      />

      <AlertEditorSheet
        alert={editingAlert}
        onClose={() => setEditingAlert(null)}
        onSave={handleConfirmAlert}
        isDark={isDark}
      />
    </ChatContainer>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.initialMessage === nextProps.initialMessage &&
    prevProps.botName === nextProps.botName &&
    prevProps.onConfirmGoal === nextProps.onConfirmGoal &&
    prevProps.onConfirmAlert === nextProps.onConfirmAlert
  );
});