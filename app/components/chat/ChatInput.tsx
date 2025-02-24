import { useTheme, YStack, XStack, Input, Button, Text } from 'tamagui';
import { Mic, Camera, Paperclip, Send } from '@tamagui/lucide-icons';

interface ChatInputProps {
  input: string;
  isTyping: boolean;
  isVoiceModeActive: boolean;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onToggleVoiceMode: () => void;
  onCaptureImage: () => void;
  onUpload: () => void;
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
  inputRef,
  isInputFocused,
  setIsInputFocused,
}: ChatInputProps) => {
  const theme = useTheme();
  const isDark = theme.name === 'dark';

  return (
    <YStack 
      borderTopWidth={1}
      borderColor="$gray4"
      backgroundColor="$background"
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
          backgroundColor={isDark ? '$gray2' : '$white'}
          borderWidth={1}
          borderColor="$gray4"
          borderRadius="$4"
          paddingHorizontal="$3"
          paddingVertical="$2"
          disabled={isTyping}
          color="$color"
          placeholderTextColor="$gray8"
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
          borderColor="$gray4"
          pressStyle={{ opacity: 0.7 }}
          onPress={onToggleVoiceMode}
          disabled={isTyping}
          icon={<Mic 
            size={18} 
            color={isVoiceModeActive ? '$white' : '$gray10'} 
          />}
        />

        <Button
          size="$3"
          circular
          backgroundColor="transparent"
          borderWidth={1}
          borderColor="$gray4"
          pressStyle={{ opacity: 0.7 }}
          onPress={onCaptureImage}
          disabled={isTyping}
          icon={<Camera 
            size={18} 
            color="$gray10" 
          />}
        />

        <Button
          size="$3"
          circular
          backgroundColor="transparent"
          borderWidth={1}
          borderColor="$gray4"
          pressStyle={{ opacity: 0.7 }}
          onPress={onUpload}
          disabled={isTyping}
          icon={<Paperclip 
            size={18} 
            color="$gray10" 
          />}
        />

        <Button
          size="$3"
          circular
          backgroundColor={input.trim() && !isTyping ? '$blue9' : 'transparent'}
          borderWidth={1}
          borderColor="$gray4"
          pressStyle={{ opacity: 0.7 }}
          onPress={onSend}
          disabled={!input.trim() || isTyping}
          icon={<Send 
            size={18} 
            color={input.trim() && !isTyping ? '$white' : '$gray8'} 
          />}
        />
      </XStack>
      
      {isVoiceModeActive && (
        <Text
          size="$2"
          color="$gray9"
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