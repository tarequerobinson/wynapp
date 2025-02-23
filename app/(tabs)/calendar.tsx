// app/(tabs)/calendar.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'react-native-calendars';
import { YStack, XStack, Text, Button, ScrollView, styled, Theme, Card } from 'tamagui';
import { 
  Calendar as CalendarIcon, 
  DollarSign, Users,FileText, Briefcase, Info,
  List, 
  RefreshCw, 
  Bell
} from '@tamagui/lucide-icons';
import { format, isSameDay, isToday, isBefore, isAfter } from 'date-fns';
import { useColorScheme, Alert } from 'react-native';
import { fetchJseEvents, ExtractedEvent } from '@/api/calendar-events';
import { EventSheet } from '@/components/common/EventSheet'; // Updated import path
import { colors } from '@/utils/colors';
const ListView = ({
  events,
  isDark,
  setEventAlert,
}: {
  events: ExtractedEvent[];
  isDark: boolean;
  setEventAlert: (event: ExtractedEvent) => void;
}) => {
  const today = new Date();
  const [todayEvents, upcomingEvents, pastEvents] = useMemo(() => [
    events.filter(event => isToday(event.eventDate)),
    events.filter(event => isAfter(event.eventDate, today)),
    events.filter(event => isBefore(event.eventDate, today)),
  ].map(events => events.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())), [events]);

  const renderSection = (title: string, sectionEvents: ExtractedEvent[]) => (
    sectionEvents.length > 0 && (
      <YStack space="$3" marginBottom="$4">
        <Text fontSize="$6" fontWeight="600" color={isDark ? '#ffffff' : '#1a1a1a'}>{title}</Text>
        {sectionEvents.map(event => {
          const Icon = eventIcons[event.type] || Info;
          return (
            <EventCard key={event.title} type={event.type} dark={isDark}>
              <YStack space="$2">
                <EventTypeIndicator type={event.type}>
                  <Icon size="$1" color={isDark ? '#000000' : '#ffffff'} />
                  <Text color={isDark ? '#000000' : '#ffffff'} fontSize="$2" textTransform="capitalize">
                    {event.type}
                  </Text>
                </EventTypeIndicator>
                <Text fontSize="$4" color={isDark ? '#ffffff' : '#1a1a1a'}>{event.title}</Text>
                <Text fontSize="$3" color={isDark ? '#a6a6a6' : '#666666'}>
                  {format(event.eventDate, 'MMM d, yyyy')}
                </Text>
                <Text fontSize="$3" color={isDark ? '#a6a6a6' : '#666666'}>
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
        })}
      </YStack>
    )
  );

  return (
    <ScrollView flex={1}>
      <YStack padding="$4" space="$2">
        {renderSection('Today', todayEvents)}
        {renderSection('Upcoming Events', upcomingEvents)}
        {renderSection('Past Events', pastEvents)}
        {(todayEvents.length + upcomingEvents.length + pastEvents.length) === 0 && (
          <Text color={isDark ? '#a6a6a6' : '#666666'} textAlign="center">
            No events with confirmed dates available
          </Text>
        )}
      </YStack>
    </ScrollView>
  );
};

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
export default function BusinessCalendarScreen() {
  const systemColorScheme = useColorScheme();
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
      console.log('Events fetched:', fetchedEvents);
      setEvents(fetchedEvents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const currentColors = useMemo(() => (isDark ? colors.dark : colors.light), [isDark]);

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
    const dates: { [key: string]: any } = {};
    events.forEach(event => {
      const dateStr = format(event.eventDate, 'yyyy-MM-dd');
      dates[dateStr] = {
        marked: true,
        dotColor: currentColors.types[event.type],
        selected: isSameDay(event.eventDate, selectedDate),
        selectedColor: currentColors.primary,
      };
    });
    return dates;
  }, [events, selectedDate, isDark]);

  const setEventAlert = (event: ExtractedEvent) => {
    Alert.alert("Alert Set", `Would set notification for ${event.title} on ${format(event.eventDate, 'MMM d, yyyy')}`);
  };

  if (loading) {
    return (
      <Theme name={isDark ? 'dark' : 'light'}>
        <YStack 
          flex={1} 
          justifyContent="center" 
          alignItems="center" 
          backgroundColor={currentColors.background}
          space="$4"
        >
          {/* Animated Spinner */}
          <YStack
            animation="bouncy"
            scale={1}
            enterStyle={{ scale: 0 }}
            width={60}
            height={60}
            borderRadius={30}
            backgroundColor={currentColors.primary}
            justifyContent="center"
            alignItems="center"
          >
            <CalendarIcon 
              size="$2" 
              color={currentColors.background}
              animation="pulse"
              animateOnly={['rotate']}
              rotate="360deg"
              animationDuration={2000}
            />
          </YStack>
  
          {/* Loading Text */}
          <YStack space="$2" alignItems="center">
            <Text 
              fontSize="$6"
              fontWeight="600"
              color={currentColors.text}
              animation="quick"
              opacity={1}
              enterStyle={{ opacity: 0 }}
            >
              Loading Events
            </Text>
            <Text 
              fontSize="$3"
              color={currentColors.textSecondary}
              textAlign="center"
              maxWidth={240}
            >
              Fetching the latest calendar updates...
            </Text>
          </YStack>
  
          {/* Progress Dots */}
          <XStack space="$2">
            {[1, 2, 3].map((i) => (
              <YStack
                key={i}
                width={8}
                height={8}
                borderRadius={4}
                backgroundColor={currentColors.primary}
                animation="lazy"
                opacity={0.3}
                animateOnly={['opacity']}
                animation={{
                  type: 'timing',
                  loop: true,
                  duration: 800,
                  delay: i * 200,
                }}
                enterStyle={{ opacity: 0.3 }}
                exitStyle={{ opacity: 0.3 }}
                opacity={1}
              />
            ))}
          </XStack>
  
          {/* Refresh Button */}
          <Button
            size="$3"
            variant="outlined"
            borderColor={currentColors.primary}
            color={currentColors.primary}
            icon={<RefreshCw size="$1" />}
            onPress={fetchEvents}
            marginTop="$4"
          >
            Refresh Now
          </Button>
        </YStack>
      </Theme>
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
            <Button 
              size="$3" 
              chromeless 
              icon={isListView ? CalendarIcon : List} 
              onPress={() => setIsListView(!isListView)}
            />
            <Button 
              size="$3" 
              chromeless 
              icon={<RefreshCw />} 
              onPress={fetchEvents}
            />
          </XStack>
        </XStack>

        {isListView ? (
          <ListView events={events} isDark={isDark} setEventAlert={setEventAlert} />
        ) : (
          <YStack padding="$3" flex={1}>
            <Calendar
              markedDates={markedDates}
              onDayPress={(day) => {
                const selected = new Date(day.year, day.month - 1, day.day);
                console.log('Tapped date:', selected);
                setSelectedDate(selected);
                setShowEventSheet(true);
                console.log('Sheet should open');
              }}
              theme={calendarTheme}
            />
          </YStack>
        )}

        <EventSheet
          open={showEventSheet}
          onOpenChange={setShowEventSheet}
          selectedDate={selectedDate}
          events={events}
          isDark={isDark}
          setEventAlert={setEventAlert}
        />
      </YStack>
    </Theme>
  );
}