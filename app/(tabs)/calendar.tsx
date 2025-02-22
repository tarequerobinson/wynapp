import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'react-native-calendars';
import { Sheet } from '@tamagui/sheet';
import { YStack, XStack, Text, Button, ScrollView, Card, styled, Theme, useTheme } from 'tamagui';
import { Calendar as CalendarIcon, List, RefreshCw } from '@tamagui/lucide-icons';
import { format, isSameDay, isToday, isBefore, isAfter } from 'date-fns';
import { useColorScheme } from 'react-native';
import { fetchJseEvents, ExtractedEvent } from '@/api/calendar-events';

const EventCard = styled(Card, {
  borderRadius: '$4',
  padding: '$3',
  marginBottom: '$3',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  elevate: true,
  variants: {
    dark: { backgroundColor: '#000000', borderColor: '$gray4' },
  } as const,
});

export default function BusinessCalendarScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useTheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventSheet, setShowEventSheet] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const [events, setEvents] = useState<ExtractedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const fetchedEvents = await fetchJseEvents();
      setEvents(fetchedEvents); // All events now have valid eventDate
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const colors = {
    light: { background: '#ffffff', text: '#1a1a1a', textSecondary: '#666666', border: '#e6e6e6', primary: '#0066cc', today: '#0052a3' },
    dark: { background: '#000000', text: '#ffffff', textSecondary: '#a6a6a6', border: '#333333', primary: '#4d94ff', today: '#80b3ff' },
  };

  const currentColors = isDark ? colors.dark : colors.light;

  const calendarTheme = {
    backgroundColor: 'transparent',
    calendarBackground: 'transparent',
    textSectionTitleColor: currentColors.textSecondary,
    selectedDayBackgroundColor: currentColors.primary,
    selectedDayTextColor: currentColors.background,
    todayTextColor: currentColors.today,
    dayTextColor: currentColors.text,
    textDisabledColor: '$gray8',
    dotColor: currentColors.primary,
    monthTextColor: currentColors.text,
    textMonthFontWeight: '600',
    arrowColor: currentColors.textSecondary,
  };

  const getEventsForDate = (date: Date) => events.filter(event => isSameDay(event.eventDate, date));

  const markedDates = useMemo(() => {
    return events.reduce((acc, event) => {
      const dateStr = format(event.eventDate, 'yyyy-MM-dd');
      return { ...acc, [dateStr]: { marked: true, dotColor: currentColors.primary } };
    }, {});
  }, [events, currentColors.primary]);

  const EventSheet = () => {
    const dayEvents = getEventsForDate(selectedDate);

    return (
      <Sheet
        modal
        open={showEventSheet}
        onOpenChange={setShowEventSheet}
        snapPoints={[85]}
        dismissOnSnapToBottom
        zIndex={100000}
      >
        <Sheet.Overlay animation="quick" opacity={0.5} />
        <Sheet.Frame padding="$4" backgroundColor={currentColors.background}>
          <Sheet.Handle backgroundColor="$gray5" />
          <YStack space="$4">
            <Text fontSize="$7" fontWeight="600" color={currentColors.text}>
              {format(selectedDate, 'MMMM d, yyyy')}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack space="$3">
                {dayEvents.length > 0 ? (
                  dayEvents.map(event => (
                    <EventCard key={event.title} dark={isDark}>
                      <YStack space="$2">
                        <Text fontSize="$4" color={currentColors.text}>{event.title}</Text>
                        <Text fontSize="$3" color={currentColors.textSecondary}>
                          {format(event.eventDate, 'MMM d, yyyy')}
                        </Text>
                      </YStack>
                    </EventCard>
                  ))
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

  const ListView = () => {
    const today = new Date();
    const [todayEvents, upcomingEvents, pastEvents] = useMemo(() => [
      events.filter(event => isToday(event.eventDate)),
      events.filter(event => isAfter(event.eventDate, today)),
      events.filter(event => isBefore(event.eventDate, today)),
    ].map(events => events.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())), [events]);

    const renderSection = (title: string, sectionEvents: ExtractedEvent[]) => (
      sectionEvents.length > 0 && (
        <YStack space="$3" marginBottom="$4">
          <Text fontSize="$6" fontWeight="600" color={currentColors.text}>{title}</Text>
          {sectionEvents.map(event => (
            <EventCard key={event.title} dark={isDark}>
              <YStack space="$2">
                <Text fontSize="$4" color={currentColors.text}>{event.title}</Text>
                <Text fontSize="$3" color={currentColors.textSecondary}>
                  {format(event.eventDate, 'MMM d, yyyy')}
                </Text>
              </YStack>
            </EventCard>
          ))}
        </YStack>
      )
    );

    return (
      <ScrollView>
        <YStack padding="$4" space="$2">
          {renderSection('Today', todayEvents)}
          {renderSection('Upcoming Events', upcomingEvents)}
          {renderSection('Past Events', pastEvents)}
          {(todayEvents.length + upcomingEvents.length + pastEvents.length) === 0 && (
            <Text color={currentColors.textSecondary} textAlign="center">
              No events with confirmed dates available
            </Text>
          )}
        </YStack>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={currentColors.background}>
        <Text color={currentColors.text}>Loading events...</Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={currentColors.background} space="$4">
        <Text color="$red10">{error}</Text>
        <Button size="$4" icon={<RefreshCw />} onPress={fetchEvents}>Retry</Button>
      </YStack>
    );
  }

  return (
    <Theme name={isDark ? 'dark' : 'light'}>
      <YStack flex={1} backgroundColor={currentColors.background}>
        <XStack 
          padding="$4"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor={currentColors.border}
        >
          <Text fontSize="$8" fontWeight="600" color={currentColors.text}>Calendar</Text>
          <XStack space="$2">
            <Button size="$3" chromeless icon={isListView ? CalendarIcon : List} onPress={() => setIsListView(!isListView)} />
            <Button size="$3" chromeless icon={<RefreshCw />} onPress={fetchEvents} />
          </XStack>
        </XStack>

        {isListView ? (
          <ListView />
        ) : (
          <YStack padding="$3">
            <Calendar
              markedDates={markedDates}
              onDayPress={(day) => {
                setSelectedDate(new Date(day.timestamp));
                setShowEventSheet(true);
              }}
              theme={calendarTheme}
            />
          </YStack>
        )}

        <EventSheet />
      </YStack>
    </Theme>
  );
}