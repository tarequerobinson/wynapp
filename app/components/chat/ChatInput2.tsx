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
    <YStack padding="$2" backgroundColor={isDark ? '$gray2Dark' : '$white'} elevation={isDark ? 0 : 1}>
      <XStack alignItems="center" gap="$1">
        <Input
          ref={inputRef}
          flex={1}
          multiline
          maxHeight={80}
          value={input}
          onChangeText={onInputChange}
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
          onSubmitEditing={onSend}
        />
        <Button
          size="$2"
          circular
          icon={<Mic size={18} color={isVoiceModeActive ? '$red9' : 'white'} />}
          onPress={onToggleVoiceMode}
          backgroundColor={isVoiceModeActive ? '$gray9' : '$blue9'}
          disabled={isTyping}
        />
        <Button
          size="$2"
          circular
          icon={<Camera size={18} color={isTyping ? '$gray8' : 'white'} />}
          onPress={onCaptureImage}
          disabled={isTyping}
          backgroundColor={isTyping ? 'transparent' : '$blue9'}
        />
        <Button
          size="$2"
          circular
          icon={<Paperclip size={18} color={isTyping ? '$gray8' : 'white'} />}
          onPress={onUpload}
          disabled={isTyping}
          backgroundColor={isTyping ? 'transparent' : '$blue9'}
        />
        <Button
          size="$2"
          circular
          icon={<Send size={18} color={!input?.trim() || isTyping ? '$gray8' : 'white'} />}
          onPress={onSend}
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
  );
};