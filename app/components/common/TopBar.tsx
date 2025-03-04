// components/TopBar.jsx
import React from 'react';
import { XStack, Button, H4, useTheme } from 'tamagui';
import { CalendarIcon, List, RefreshCw } from '@tamagui/lucide-icons';

export const TopBar = ({ title, isListView, setIsListView, onRefresh }) => {
  const theme = useTheme();
  const isDark = theme.name === 'dark';

  return (
    <XStack
      height={56}
      paddingHorizontal="$4"
      alignItems="center"
      justifyContent="space-between"
      backgroundColor={isDark ? '$gray1Dark' : '$background'}
      borderBottomWidth={1}
      borderBottomColor={isDark ? '$gray5' : '$borderColor'}
    >
      <H4 color="$color" fontSize="$6" fontWeight="800">
        {title}
      </H4>
      <XStack space="$2">
        <Button
          size="$3"
          circular
          chromeless
          icon={isListView ? <CalendarIcon size="$1.5" /> : <List size="$1.5" />}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsListView(!isListView);
          }}
        />
        <Button
          size="$3"
          circular
          chromeless
          icon={<RefreshCw size="$1.5" />}
          onPress={onRefresh}
        />
      </XStack>
    </XStack>
  );
};