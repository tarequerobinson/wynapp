import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Sheet, XStack, YStack } from 'tamagui';
import { Earnings, Dividend, Split } from '@tamagui/lucide-icons';

type EventTypeSelectorProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isDark: boolean;
  selectedEvent: 'earnings' | 'dividend' | 'split';
  onSelectEvent: (event: 'earnings' | 'dividend' | 'split') => void;
};

export const EventTypeSelector = ({ isOpen, onOpenChange, isDark, selectedEvent, onSelectEvent }: EventTypeSelectorProps) => {
  const eventOptions = [
    { value: 'earnings', icon: Earnings, label: 'Earnings' },
    { value: 'dividend', icon: Dividend, label: 'Dividend' },
    { value: 'split', icon: Split, label: 'Split' },
  ];

  return (
    <Sheet modal open={isOpen} onOpenChange={onOpenChange} snapPoints={[50]} dismissOnSnapToBottom>
      <Sheet.Overlay backgroundColor={isDark ? '$gray10' : '$gray5'} opacity={0.5} />
      <Sheet.Frame padding="$3" backgroundColor={isDark ? '$gray1' : '$background'} borderTopLeftRadius="$4" borderTopRightRadius="$4">
        <Sheet.Handle backgroundColor={isDark ? '$gray4' : '$gray6'} />
        <YStack space="$3">
          <Text style={[styles.selectorTitle, { color: isDark ? '#fff' : '#000' }]}>Select Event Type</Text>
          {eventOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, { backgroundColor: selectedEvent === option.value ? (isDark ? '$gray4' : '$gray3') : 'transparent' }]}
              onPress={() => {
                onSelectEvent(option.value);
                onOpenChange(false);
              }}
            >
              <XStack alignItems="center" space="$2">
                <option.icon size={20} color={isDark ? '#fff' : '#000'} />
                <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>{option.label}</Text>
              </XStack>
            </TouchableOpacity>
          ))}
          <Button theme="gray" size="$3" onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  selectorTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  option: { padding: 12, borderRadius: 8 },
  optionText: { fontSize: 16 },
});