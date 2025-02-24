import { useState, useRef } from 'react';
import { ScrollView, XStack, Button, Text, YStack, useTheme } from 'tamagui';
import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons';
import { QuickPrompt } from './types';

interface QuickPromptsProps {
  prompts: QuickPrompt[];
  onPromptClick: (prompt: QuickPrompt) => void;
}

export const QuickPrompts = ({ prompts, onPromptClick }: QuickPromptsProps) => {
  const theme = useTheme();
  const isDark = theme.name === 'dark';
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const position = event.nativeEvent.contentOffset.x;
    const maxScroll = event.nativeEvent.contentSize.width - event.nativeEvent.layoutMeasurement.width;
    
    setScrollPosition(position);
    setShowLeftArrow(position > 0);
    setShowRightArrow(position < maxScroll - 10);
  };

  const scrollTo = (direction: 'left' | 'right') => {
    const scrollAmount = direction === 'left' ? -200 : 200;
    scrollViewRef.current?.scrollTo({
      x: scrollPosition + scrollAmount,
      animated: true,
    });
  };

  return (
    <YStack 
      width="100%"
      backgroundColor="$background"
    >
      <XStack position="relative" alignItems="center">
        {showLeftArrow && (
          <Button
            position="absolute"
            left="$1"
            zIndex={1}
            size="$2"
            circular
            onPress={() => scrollTo('left')}
            backgroundColor="$gray4"
            hoverStyle={{ backgroundColor: "$gray5" }}
          >
            <ChevronLeft size={16} color="$gray10" />
          </Button>
        )}
        
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: '$2', paddingVertical: '$1' }}
          flex={1}
        >
          <XStack space="$1">
            {prompts.map((prompt, index) => (
              <Button
                key={index}
                size="$3"
                borderRadius="$4"
                backgroundColor={isDark ? '$gray3' : '$gray2'}
                elevation={isDark ? 0 : 1}
                onPress={() => onPromptClick(prompt)}
                hoverStyle={{ backgroundColor: isDark ? '$gray4' : '$gray3' }}
                pressStyle={{ scale: 0.95 }}
              >
                <XStack space="$1" alignItems="center">
                  <prompt.icon size={16} color="$color" />
                  <Text
                    fontSize="$3"
                    color="$color"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    maxWidth={200}
                  >
                    {prompt.text}
                  </Text>
                </XStack>
              </Button>
            ))}
          </XStack>
        </ScrollView>

        {showRightArrow && (
          <Button
            position="absolute"
            right="$1"
            zIndex={1}
            size="$2"
            circular
            onPress={() => scrollTo('right')}
            backgroundColor="$gray4"
            hoverStyle={{ backgroundColor: "$gray5" }}
          >
            <ChevronRight size={16} color="$gray10" />
          </Button>
        )}
      </XStack>
    </YStack>
  );
};

export default QuickPrompts;