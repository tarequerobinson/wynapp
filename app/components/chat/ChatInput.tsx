import React from 'react';
import { YStack, XStack, Input, Button, Text } from 'tamagui';
import { Mic, Camera, Paperclip, Send, Info } from '@tamagui/lucide-icons';

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
}

export const ChatInput = ({
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
}: ChatInputProps) => {
  return (
    <YStack 
      borderTopWidth={1}
      borderColor={isDark ? '$gray4Dark' : '$gray4Light'}
      backgroundColor={isDark ? '$gray1Dark' : '$gray1Light'}
    >
      <XStack 
        alignItems="center" 
        padding="$3"
        gap="$2"
      >
        <Input
          ref={inputRef}
          flex={1}
          multiline
          maxHeight={100}
          value={input}
          onChangeText={onInputChange}
          placeholder={isVoiceModeActive ? 'Tap the mic on your keyboard...' : 'Message...'}
          backgroundColor={isDark ? '$gray2Dark' : 'white'}
          borderWidth={1}
          borderColor={isDark ? '$gray3Dark' : '$gray4Light'}
          borderRadius="$4"
          paddingHorizontal="$3"
          paddingVertical="$2"
          disabled={isTyping}
          color={isDark ? '$gray12Light' : '$gray12Dark'}
          placeholderTextColor={isDark ? '$gray8Dark' : '$gray8Light'}
          fontSize={16}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onSubmitEditing={onSend}
        />

        <Button
          size="$3"
          circular
          backgroundColor={isVoiceModeActive ? '$red9' : 'transparent'}
          borderWidth={1}
          borderColor={isDark ? '$gray3Dark' : '$gray4Light'}
          pressStyle={{ opacity: 0.7 }}
          onPress={onToggleVoiceMode}
          disabled={isTyping}
          icon={<Mic 
            size={18} 
            color={isVoiceModeActive ? 'white' : isDark ? '$gray12Light' : '$gray12Dark'} 
          />}
        />

        <Button
          size="$3"
          circular
          backgroundColor="transparent"
          borderWidth={1}
          borderColor={isDark ? '$gray3Dark' : '$gray4Light'}
          pressStyle={{ opacity: 0.7 }}
          onPress={onCaptureImage}
          disabled={isTyping}
          icon={<Camera 
            size={18} 
            color={isDark ? '$gray12Light' : '$gray12Dark'} 
          />}
        />

        <Button
          size="$3"
          circular
          backgroundColor="transparent"
          borderWidth={1}
          borderColor={isDark ? '$gray3Dark' : '$gray4Light'}
          pressStyle={{ opacity: 0.7 }}
          onPress={onUpload}
          disabled={isTyping}
          icon={<Paperclip 
            size={18} 
            color={isDark ? '$gray12Light' : '$gray12Dark'} 
          />}
        />

        <Button
          size="$3"
          circular
          backgroundColor={input.trim() && !isTyping ? '$blue9' : 'transparent'}
          borderWidth={1}
          borderColor={isDark ? '$gray3Dark' : '$gray4Light'}
          pressStyle={{ opacity: 0.7 }}
          onPress={onSend}
          disabled={!input.trim() || isTyping}
          icon={<Send 
            size={18} 
            color={input.trim() && !isTyping ? 'white' : isDark ? '$gray8Dark' : '$gray8Light'} 
          />}
        />
      </XStack>
      
      {isVoiceModeActive && (
        <Text
          size="$2"
          color={isDark ? '$gray9Dark' : '$gray9Light'}
          textAlign="center"
          paddingBottom="$2"
        >
          Voice mode active - use keyboard mic
        </Text>
      )}
    </YStack>
  );
};

export default ChatInput;