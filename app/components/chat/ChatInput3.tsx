import { useState } from 'react';
import {
  YStack,
  XStack,
  Input,
  Button,
  Text,
  AnimatePresence,
} from 'tamagui';
import { Mic, Camera, Paperclip, Send, Info } from '@tamagui/lucide-icons';
import { Message } from './types'; // Assuming Message type is defined in './types'

interface ChatInputProps {
  input: string;
  isTyping: boolean;
  isVoiceModeActive: boolean;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onToggleVoiceMode: () => void;
  onCaptureImage: () => void;
  onUpload: () => void;
  isDark: boolean;
  inputRef: React.RefObject<Input>;
  isInputFocused: boolean;
  setIsInputFocused: (focused: boolean) => void;
  messages: Message[];
}

export const ChatInput3 = ({
  input,
  isTyping,
  isVoiceModeActive,
  onInputChange,
  onSend,
  onToggleVoiceMode,
  onCaptureImage,
  onUpload,
  isDark,
  inputRef,
  isInputFocused,
  setIsInputFocused,
  messages,
}: ChatInputProps) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <YStack
      padding="$3"
      backgroundColor="transparent"
      alignItems="center"
    >
      <XStack
        backgroundColor={isDark ? '$gray3Dark' : '$white'}
        borderRadius="$10"
        padding="$2"
        paddingRight="$1"
        gap="$2"
        elevation={isDark ? 1 : 3}
        shadowColor={isDark ? '$gray8' : '$gray5'}
        shadowRadius={8}
        shadowOffset={{ width: 0, height: -2 }}
        width="100%"
        maxWidth={800}
        animation="quick"
        enterStyle={{ y: 20, opacity: 0 }}
        exitStyle={{ y: 20, opacity: 0 }}
      >
        <Input
          ref={inputRef}
          flex={1}
          multiline
          maxHeight={120}
          value={input}
          onChangeText={onInputChange}
          placeholder={isVoiceModeActive ? 'Tap mic to speak...' : 'Type a message...'}
          backgroundColor="transparent"
          borderWidth={0}
          padding="$2"
          paddingLeft="$3"
          disabled={isTyping}
          color={isDark ? '$gray12' : '$gray11'}
          placeholderTextColor={isDark ? '$gray7' : '$gray6'}
          fontSize="$4"
          hoverStyle={{ backgroundColor: isDark ? '$gray4Dark' : '$gray1' }}
          focusStyle={{ borderColor: '$blue7', scale: 1.01 }}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onSubmitEditing={onSend}
        />
        <XStack gap="$1" alignItems="center">
          {!input.trim() && !isTyping ? (
            <>
              <Button
                size="$3"
                circular
                icon={<Mic size={20} color={isVoiceModeActive ? '$red9' : isDark ? '$gray10' : '$blue9'} />}
                onPress={onToggleVoiceMode}
                backgroundColor={isVoiceModeActive ? '$red5' : 'transparent'}
                hoverStyle={{ backgroundColor: isVoiceModeActive ? '$red6' : '$blue5' }}
                pressStyle={{ scale: 0.95 }}
                disabled={isTyping}
                animation="quick"
              />
              <Button
                size="$3"
                circular
                icon={<Camera size={20} color={isDark ? '$gray10' : '$blue9'} />}
                onPress={onCaptureImage}
                backgroundColor="transparent"
                hoverStyle={{ backgroundColor: '$blue5' }}
                pressStyle={{ scale: 0.95 }}
                disabled={isTyping}
                animation="quick"
              />
              <Button
                size="$3"
                circular
                icon={<Paperclip size={20} color={isDark ? '$gray10' : '$blue9'} />}
                onPress={onUpload}
                backgroundColor="transparent"
                hoverStyle={{ backgroundColor: '$blue5' }}
                pressStyle={{ scale: 0.95 }}
                disabled={isTyping}
                animation="quick"
              />
            </>
          ) : (
            <Button
              size="$3"
              circular
              icon={<Send size={20} color={!input?.trim() || isTyping ? '$gray8' : isDark ? '$blue9' : '$white'} />}
              onPress={onSend}
              backgroundColor={!input?.trim() || isTyping ? 'transparent' : '$blue9'}
              hoverStyle={{ backgroundColor: !input?.trim() || isTyping ? '$gray5' : '$blue10' }}
              pressStyle={{ scale: 0.95 }}
              disabled={!input?.trim() || isTyping}
              animation="quick"
            />
          )}
        </XStack>
      </XStack>

      <AnimatePresence>
        {(isVoiceModeActive || (!input.trim() && !messages.length)) && (
          <Text
            fontSize="$2"
            color={isDark ? '$gray9' : '$gray7'}
            textAlign="center"
            marginTop="$2"
            animation="lazy"
            enterStyle={{ opacity: 0, y: -10 }}
            exitStyle={{ opacity: 0, y: -10 }}
            backgroundColor={isDark ? '$gray3Dark' : '$gray2'}
            padding="$1"
            borderRadius="$4"
            position="absolute"
            bottom={60}
            left={0}
            right={0}
            maxWidth={300}
            alignSelf="center"
            zIndex={10}
          >
            <Info size={14} color="$red9" />{' '}
            {isVoiceModeActive ? 'Voice mode active - use keyboard mic' : 'AI Assistant may produce inaccurate information'}
          </Text>
        )}
      </AnimatePresence>
    </YStack>
  );
}; // Added semicolon here