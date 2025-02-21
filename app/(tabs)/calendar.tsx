import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import { Sheet } from '@tamagui/sheet';
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Card,
  View,
  styled,
  Theme,
  useTheme,
} from 'tamagui';
import { Bell, BellOff, Moon, Sun, Calendar as CalendarIcon, List, X } from '@tamagui/lucide-icons';
import { format, isSameDay, isToday, isBefore, isAfter } from 'date-fns';
import { useColorScheme } from 'react-native';

interface BusinessEvent {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  eventDate: Date;
  eventType: string;
  company: string;
}

const EventCard = styled(Card, {
  borderRadius: '$4',
  padding: '$3',
  marginBottom: '$3',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  elevate: true,
  variants: {
    dark: {
      true: {
        backgroundColor: '#000000', // Changed from $gray2 to #000000
        borderColor: '$gray4'
      },
    },
  } as const,
});


const EventTag = styled(View, {
  borderRadius: '$2',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  alignSelf: 'flex-start',
});

export default function BusinessCalendarScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useTheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventSheet, setShowEventSheet] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isListView, setIsListView] = useState(false);

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const colors = {
    light: {
      background: '#ffffff',
      text: '#1a1a1a',
      textSecondary: '#666666',
      border: '#e6e6e6',
      primary: '#0066cc',
      today: '#0052a3',
    },
    dark: {
      background: '#000000',
      text: '#ffffff',
      textSecondary: '#a6a6a6',
      border: '#333333',
      primary: '#4d94ff',
      today: '#80b3ff',
    }
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

  const eventColors = {
    AGM: { bg: isDark ? '#2a3d66' : '#e6f0ff', text: isDark ? '#99b3ff' : '#003366' },
    'Board Meeting': { bg: isDark ? '#333333' : '#f2f2f2', text: isDark ? '#cccccc' : '#666666' },
    Earnings: { bg: isDark ? '#2a662a' : '#e6ffe6', text: isDark ? '#99ff99' : '#006600' },
    'Stock Split': { bg: isDark ? '#4d2a66' : '#f2e6ff', text: isDark ? '#cc99ff' : '#660066' },
    Default: { bg: isDark ? '#333333' : '#f2f2f2', text: isDark ? '#cccccc' : '#666666' },
  };

  const mockEvents: BusinessEvent[] = [
    {
      id: '1',
      title: 'JSE Annual General Meeting',
      link: 'https://example.com/jse-agm',
      pubDate: '2025-02-20',
      description: 'Annual General Meeting for JSE Corp',
      eventDate: new Date('2025-02-25'),
      eventType: 'AGM',
      company: 'JSE Corp',
    },
    {
      id: '2',
      title: 'Q1 Earnings Report',
      link: 'https://example.com/earnings',
      pubDate: '2025-02-21',
      description: 'Q1 Earnings Report for ABC Ltd',
      eventDate: new Date('2025-03-05'),
      eventType: 'Earnings',
      company: 'ABC Ltd',
    },
    {
      id: '3',
      title: 'Board Meeting',
      link: 'https://example.com/board',
      pubDate: '2025-02-22',
      description: 'Quarterly Board Meeting for XYZ Corp',
      eventDate: new Date('2025-03-15'),
      eventType: 'Board Meeting',
      company: 'XYZ Corp',
    },
    {
      id: '4',
      title: 'Stock Split Announcement',
      link: 'https://example.com/split',
      pubDate: '2025-02-23',
      description: '2:1 Stock Split for Tech Inc',
      eventDate: new Date('2025-04-01'),
      eventType: 'Stock Split',
      company: 'Tech Inc',
    },
    {
      id: '5',
      title: 'Interim Results',
      link: 'https://example.com/interim',
      pubDate: '2025-02-24',
      description: 'Interim Financial Results for Global Corp',
      eventDate: new Date('2025-02-21'),
      eventType: 'Earnings',
      company: 'Global Corp',
    },
  ];

  const getEventTypeColor = (type: string) => eventColors[type as keyof typeof eventColors] || eventColors.Default;

  const toggleAlerts = () => {
    setAlertsEnabled(!alertsEnabled);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const getEventsForDate = (date: Date) => mockEvents.filter(event => isSameDay(event.eventDate, date));

  const markedDates = mockEvents.reduce((acc, event) => ({
    ...acc,
    [format(event.eventDate, 'yyyy-MM-dd')]: {
      marked: true,
      dotColor: currentColors.primary,
    }
  }), {});

  const EventSheet = () => {
    const events = getEventsForDate(selectedDate);
    
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
                {events.length > 0 ? (
                  events.map(event => (
                    <EventCard key={event.id} dark={isDark}>
                      <YStack space="$2">
                        <EventTag backgroundColor={getEventTypeColor(event.eventType).bg}>
                          <Text color={getEventTypeColor(event.eventType).text}>
                            {event.eventType}
                          </Text>
                        </EventTag>
                        <Text fontSize="$5" fontWeight="600" color={currentColors.text}>
                          {event.company}
                        </Text>
                        <Text fontSize="$4" color={currentColors.textSecondary}>
                          {event.title}
                        </Text>
                        <Text fontSize="$3" color="$gray10">
                          {event.description}
                        </Text>
                        <Button
                          size="$3"
                          backgroundColor="$blue10"
                          color="$white"
                          onPress={() => {/* Handle event details */}}
                        >
                          View Details
                        </Button>
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
    const [todayEvents, upcomingEvents, pastEvents] = [
      mockEvents.filter(event => isToday(event.eventDate)),
      mockEvents.filter(event => isAfter(event.eventDate, today)),
      mockEvents.filter(event => isBefore(event.eventDate, today)),
    ].map(events => events.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime()));

    const renderSection = (title: string, events: BusinessEvent[]) => (
      events.length > 0 && (
        <YStack space="$3" marginBottom="$4">
          <Text fontSize="$6" fontWeight="600" color={currentColors.text}>
            {title}
          </Text>
          {events.map(event => (
            <EventCard key={event.id} dark={isDark}>
              <XStack justifyContent="space-between" alignItems="center">
                <YStack space="$2">
                  <XStack space="$2" alignItems="center">
                    <EventTag backgroundColor={getEventTypeColor(event.eventType).bg}>
                      <Text color={getEventTypeColor(event.eventType).text}>
                        {event.eventType}
                      </Text>
                    </EventTag>
                    <Text fontSize="$3" color={currentColors.textSecondary}>
                      {format(event.eventDate, 'MMM d, yyyy')}
                    </Text>
                  </XStack>
                  <Text fontSize="$5" fontWeight="600" color={currentColors.text}>
                    {event.company}
                  </Text>
                  <Text fontSize="$4" color={currentColors.textSecondary}>
                    {event.title}
                  </Text>
                </YStack>
                <Button
                  size="$2"
                  chromeless
                  icon={<X size="$1" color="$red10" />}
                  onPress={() => {/* Handle delete */}}
                />
              </XStack>
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
        </YStack>
      </ScrollView>
    );
  };

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
          <Text fontSize="$8" fontWeight="600" color={currentColors.text}>
            Calendar
          </Text>
          <XStack space="$2">
            <Button
              size="$3"
              chromeless
              icon={isListView ? CalendarIcon : List}
              onPress={() => setIsListView(!isListView)}
            />
            {/* <Button
              size="$3"
              chromeless
              icon={isDark ? Moon : Sun}
              onPress={() => setIsDark(!isDark)}
            /> */}
            <Button
              size="$3"
              chromeless
              icon={alertsEnabled ? Bell : BellOff}
              onPress={toggleAlerts}
            />
          </XStack>
        </XStack>

        {showAlert && (
          <Card
            padding="$3"
            margin="$4"
            marginBottom="$2"
            backgroundColor={alertsEnabled ? '$blue10' : '$gray3'}
            elevate
            animation="quick"
            enterStyle={{ opacity: 0, y: -10 }}
            exitStyle={{ opacity: 0, y: -10 }}
          >
            <Text color="$white">
              {alertsEnabled ? 'Alerts Enabled' : 'Alerts Disabled'}
            </Text>
          </Card>
        )}

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