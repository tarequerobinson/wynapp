// app/(tabs)/calendar.tsx (final version)
import React, { useState, useEffect, useMemo } from 'react';
import { Animated } from 'react-native'; // Added Animated for loading animation
import { Calendar } from 'react-native-calendars';
import { YStack, XStack, Text, Button, ScrollView, styled, Theme, Card, useTheme, H4 } from 'tamagui'; // Added useTheme, H4
import { 
  Calendar as CalendarIcon, 
  DollarSign, Users, FileText, Briefcase, Info,
  List, 
  RefreshCw, 
  Bell
} from '@tamagui/lucide-icons';
import { format, isSameDay, isToday, isBefore, isAfter } from 'date-fns';
import { useColorScheme, Alert } from 'react-native';
import * as Haptics from 'expo-haptics'; // Added for haptic feedback in TopBar
import { fetchJseEvents, ExtractedEvent } from '@/api/calendar-events';
import { EventSheet } from '@/components/common/EventSheet'; // Kept as imported
import { colors } from '@/utils/colors';

// Keep ListView exactly as defined
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

// Keep EventCard as defined
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

// Keep EventTypeIndicator as defined
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

// Keep eventIcons as defined
const eventIcons = {
  dividend: DollarSign,
  meeting: Users,
  financial: FileText,
  corporate: Briefcase,
  other: Info,
} as const;

// New styled container for theme consistency
const CalendarContainer = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
  variants: {
    dark: { true: { backgroundColor: '$gray1Dark' } },
  } as const,
});

// New TopBar component
const TopBar = styled(XStack, {
  height: 56,
  paddingHorizontal: '$4',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '$background',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  variants: {
    dark: { true: { backgroundColor: '$gray1Dark', borderBottomColor: '$gray5Dark' } },
  } as const,
});

// New LoadingScreen with animation from second version
const AnimatedYStack = Animated.createAnimatedComponent(YStack);

const LoadingScreen = ({ fetchEvents }: { fetchEvents: () => void }) => {
  const theme = useTheme();
  const isDark = theme.name === 'dark';

  return (
    <CalendarContainer dark={isDark} justifyContent="center" alignItems="center" space="$4">
      <YStack animation="bouncy" enterStyle={{ scale: 0.8, opacity: 0 }} scale={1} opacity={1} space="$6" alignItems="center">
        <YStack
          width={80}
          height={80}
          borderRadius={40}
          backgroundColor="$blue10"
          justifyContent="center"
          alignItems="center"
          animation="quick"
          enterStyle={{ rotate: '0deg' }}
          rotate="8deg"
        >
          <CalendarIcon
            size="$3"
            color="$background"
            animation="pulse"
            animateOnly={['rotate', 'scale']}
            rotate="360deg"
            scale={1.1}
            animationDuration={2200}
          />
        </YStack>
        <YStack space="$3" alignItems="center">
          <Text fontSize="$7" fontWeight="800" color="$color" animation="quick" enterStyle={{ opacity: 0, scale: 0.9 }}>
            Calendar Events
          </Text>
          <Text
            fontSize="$4"
            color="$gray10"
            textAlign="center"
            maxWidth={300}
            animation={{ type: 'timing', duration: 500, delay: 100 }}
            enterStyle={{ opacity: 0, y: 5 }}
          >
            Loading the latest JSE events...
          </Text>
        </YStack>
        <XStack space="$3" marginTop="$2">
          {[1, 2, 3, 4].map((i) => (
            <YStack
              key={i}
              width={10}
              height={10}
              borderRadius={5}
              backgroundColor="$blue10"
              opacity={0.3}
              animation={{ type: 'timing', loop: true, duration: 1000, delay: i * 150 }}
              animateOnly={['opacity', 'scale']}
              enterStyle={{ opacity: 0.3, scale: 0.8 }}
              opacity={1}
              scale={1}
            />
          ))}
        </XStack>
      </YStack>
      <Button
        size="$4"
        variant="outlined"
        borderColor="$blue10"
        color="$blue10"
        icon={<RefreshCw size="$1" />}
        onPress={fetchEvents}
        animation="quick"
        enterStyle={{ opacity: 0, scale: 0.9, y: 10 }}
      >
        Refresh Now
      </Button>
    </CalendarContainer>
  );
};

export default function BusinessCalendarScreen() {
  const theme = useTheme(); // For modern theme handling
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

  const calendarTheme = useMemo(() => ({
    backgroundColor: 'transparent',
    calendarBackground: 'transparent',
    textSectionTitleColor: theme.gray10?.val || currentColors.textSecondary, // Fallback to original
    selectedDayBackgroundColor: theme.blue10?.val || currentColors.primary,
    selectedDayTextColor: theme.background?.val || currentColors.background,
    todayTextColor: theme.blue9?.val || currentColors.today,
    dayTextColor: theme.color?.val || currentColors.text,
    textDisabledColor: '$gray8',
    dotColor: theme.blue10?.val || currentColors.primary,
    monthTextColor: theme.color?.val || currentColors.text,
    textMonthFontWeight: '600',
    arrowColor: theme.gray10?.val || currentColors.textSecondary,
  }), [theme, isDark]);

  const markedDates = useMemo(() => {
    const dates: { [key: string]: any } = {};
    events.forEach(event => {
      const dateStr = format(event.eventDate, 'yyyy-MM-dd');
      dates[dateStr] = {
        marked: true,
        dotColor: currentColors.types[event.type],
        selected: isSameDay(event.eventDate, selectedDate),
        selectedColor: theme.blue10?.val || currentColors.primary,
      };
    });
    return dates;
  }, [events, selectedDate, isDark, theme]);

  const setEventAlert = (event: ExtractedEvent) => {
    Alert.alert("Alert Set", `Would set notification for ${event.title} on ${format(event.eventDate, 'MMM d, yyyy')}`);
  };

  const renderTopBar = () => (
    <TopBar dark={isDark}>
      <XStack alignItems="center" space="$2">
        <CalendarIcon size={20} color={theme.blue10?.val} />
        <H4 color="$color" fontSize="$6" fontWeight="800">Calendar</H4>
      </XStack>
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
          onPress={fetchEvents}
        />
      </XStack>
    </TopBar>
  );

  if (loading) {
    return <LoadingScreen fetchEvents={fetchEvents} />;
  }

  if (error) {
    return (
      <CalendarContainer dark={isDark} justifyContent="center" alignItems="center" space="$4">
        <Text color="$red10">{error}</Text>
        <Button size="$4" icon={<RefreshCw />} onPress={fetchEvents}>Retry</Button>
      </CalendarContainer>
    );
  }

  return (
    <CalendarContainer dark={isDark}>
      {renderTopBar()}
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
    </CalendarContainer>
  );
}