// app/components/common/EventSheet.tsx
import React, { useMemo } from 'react';
import { Sheet } from '@tamagui/sheet';
import { YStack, XStack, Text, Button, ScrollView, Card, styled } from 'tamagui';
import { 
  Bell, 
  DollarSign, 
  Users, 
  FileText, 
  Briefcase, 
  Info 
} from '@tamagui/lucide-icons';
import { format, isSameDay } from 'date-fns';
import { Alert } from 'react-native';
import { ExtractedEvent } from '@/api/calendar-events';
import { colors } from '@/utils/colors';

const EventCard = styled(Card, {
  borderRadius: '$4',
  padding: '$3',
  marginBottom: '$3',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  elevate: true,
  variants: {
    type: {
      dividend: { backgroundColor: '$green2', borderColor: '$green7' },
      meeting: { backgroundColor: '$blue2', borderColor: '$blue7' },
      financial: { backgroundColor: '$yellow2', borderColor: '$yellow7' },
      corporate: { backgroundColor: '$purple2', borderColor: '$purple7' },
      other: { backgroundColor: '$gray2', borderColor: '$gray7' },
    },
    dark: {
      true: {
        dividend: { backgroundColor: '$green9', borderColor: '$green5' },
        meeting: { backgroundColor: '$blue9', borderColor: '$blue5' },
        financial: { backgroundColor: '$yellow9', borderColor: '$yellow5' },
        corporate: { backgroundColor: '$purple9', borderColor: '$purple5' },
        other: { backgroundColor: '$gray9', borderColor: '$gray5' },
      },
    },
  } as const,
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
      dividend: { backgroundColor: '$green5' },
      meeting: { backgroundColor: '$blue5' },
      financial: { backgroundColor: '$yellow5' },
      corporate: { backgroundColor: '$purple5' },
      other: { backgroundColor: '$gray5' },
    },
  } as const,
});

const eventIcons = {
  dividend: DollarSign,
  meeting: Users,
  financial: FileText,
  corporate: Briefcase,
  other: Info,
} as const;

export const EventSheet = ({
  open,
  onOpenChange,
  selectedDate,
  events,
  isDark,
  setEventAlert,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  events: ExtractedEvent[];
  isDark: boolean;
  setEventAlert: (event: ExtractedEvent) => void;
}) => {
  const currentColors = useMemo(() => (isDark ? colors.dark : colors.light), [isDark]);
  const dayEvents = events.filter(event => isSameDay(event.eventDate, selectedDate));

  console.log('Sheet rendering, selectedDate:', selectedDate, 'events:', dayEvents);

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={(newOpen) => {
        console.log('Sheet open state changed to:', newOpen);
        onOpenChange(newOpen);
      }}
      snapPoints={[85]}
      dismissOnSnapToBottom
      zIndex={100000}
      animation="medium"
    >
      <Sheet.Overlay animation="quick" opacity={0.5} />
      <Sheet.Frame padding="$4" backgroundColor={currentColors.background}>
        <Sheet.Handle backgroundColor="$gray5" />
        <YStack space="$4" flex={1}>
          <Text fontSize="$7" fontWeight="600" color={currentColors.text}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </Text>
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            <YStack space="$3">
              {dayEvents.length > 0 ? (
                dayEvents.map(event => {
                  const Icon = eventIcons[event.type] || Info;
                  return (
                    <EventCard key={event.title} type={event.type} dark={isDark}>
                      <YStack space="$2">
                        <EventTypeIndicator type={event.type}>
                          <Icon size="$1" color={currentColors.background} />
                          <Text color={currentColors.background} fontSize="$2" textTransform="capitalize">
                            {event.type}
                          </Text>
                        </EventTypeIndicator>
                        <Text fontSize="$4" color={currentColors.text}>{event.title}</Text>
                        <Text fontSize="$3" color={currentColors.textSecondary}>
                          {format(event.eventDate, 'MMM d, yyyy')}
                        </Text>
                        <Text fontSize="$3" color={currentColors.textSecondary}>
                          {event.description}
                        </Text>
                        <Button
                          size="$2"
                          icon={<Bell size="$1" />}
                          onPress={() => setEventAlert(event)}
                          theme="active"
                          alignSelf="flex-start"
                        >
                          Set Alert
                        </Button>
                      </YStack>
                    </EventCard>
                  );
                })
              ) : (
                <Text color={currentColors.textSecondary} textAlign="center">
                  No events scheduled for this date
                </Text>
              )}
            </YStack>
          </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};