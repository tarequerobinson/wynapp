import { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  YStack,
  XStack,
  ScrollView,
  Button,
  Text,
  Card,
  AnimatePresence,
  Spinner,
  useTheme,
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
} from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatbotApi, QuickPrompt } from '@/api/chatbot';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput2';
import { QuickPrompts } from './QuickPrompts';
import { ToastNotification } from './ToastNotification';
import { GoalEditorSheet } from './GoalEditorSheet';
import { AlertEditorSheet } from './AlertEditorSheet';
import { ChatbotUIProps, Message, ChatHistoryItem } from './types';

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
    if (!messages.length) {
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
      {(messages || []).map((message) => (
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
      <AnimatePresence>
        <YStack 
          key="chatbot-ui"
          flex={1}
          animation="quick"
          enterStyle={{
            opacity: 0,
            x: 50,
            rotate: '-5deg',
          }}
          exitStyle={{
            opacity: 0,
            x: -50,
            rotate: '5deg',
          }}
        >
          <ToastNotification 
            visible={toastVisible}
            title={toastTitle}
            message={toastMessage}
            bgColor={toastBgColor}
          />

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
        </YStack>
      </AnimatePresence>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.initialMessage === nextProps.initialMessage &&
    prevProps.botName === nextProps.botName &&
    prevProps.onConfirmGoal === nextProps.onConfirmGoal &&
    prevProps.onConfirmAlert === nextProps.onConfirmAlert
  );
});