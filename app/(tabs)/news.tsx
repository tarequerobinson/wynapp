import { useState } from 'react';
import { RefreshControl } from 'react-native';
import {
  YStack,
  XStack,
  Card,
  Text,
  Input,
  Button,
  ScrollView,
  Spinner,
  Sheet,
  View,
  H4,
  Paragraph,
} from 'tamagui';
import {
  Search,
  Newspaper,
  Clock,
  User,
  ArrowLeft,
  BarChart,
  Volume2,
  VolumeX,
} from '@tamagui/lucide-icons';
import { format } from 'date-fns';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: 'Gleaner' | 'Observer';
  description?: string;
  creator?: string;
  category?: string[];
  content?: string;
}

export default function NewsScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<'all' | 'Gleaner' | 'Observer'>('all');
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data
  const mockNews: NewsItem[] = [
    {
      title: 'JSE Market Surge Reported',
      link: 'https://example.com/jse-surge',
      pubDate: '2025-02-20T10:00:00Z',
      source: 'Gleaner',
      description: 'The Jamaica Stock Exchange saw a significant surge in trading volume today, driven by tech stocks.',
      creator: 'John Doe',
      category: ['Finance', 'Markets'],
      content: 'Full article content here...',
    },
    {
      title: 'New Investment Opportunities in Jamaica',
      link: 'https://example.com/investment-opps',
      pubDate: '2025-02-19T14:30:00Z',
      source: 'Observer',
      description: 'Experts highlight new investment opportunities in the Jamaican real estate market.',
      creator: 'Jane Smith',
      category: ['Investment', 'Real Estate'],
      content: 'Full article content here...',
    },
    {
      title: 'Economic Outlook for 2025',
      link: 'https://example.com/economic-outlook',
      pubDate: '2025-02-18T09:00:00Z',
      source: 'Gleaner',
      description: 'Economists predict a stable growth for Jamaica’s economy in 2025, with focus on tourism.',
      creator: 'Mike Johnson',
      category: ['Economy', 'Tourism'],
      content: 'Full article content here...',
    },
  ];

  // Initialize with mock data
  useState(() => {
    setNews(mockNews);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === 'all' || item.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  if (selectedArticle) {
    return (
      <YStack f={1} bg="$background">
        <XStack
          p="$3"
          bg="$background"
          ai="center"
          jc="space-between"
          borderBottomWidth={1}
          borderBottomColor="$gray4"
        >
          <Button
            icon={ArrowLeft}
            size="$3"
            circular
            chromeless
            onPress={() => setSelectedArticle(null)}
            hoverStyle={{ bg: '$gray3' }}
            pressStyle={{ scale: 0.95 }}
          />
          <Text fontSize="$6" fontWeight="600" color="$color" f={1} numberOfLines={1} mr="$2">
            {selectedArticle.title}
          </Text>
        </XStack>

        <ScrollView f={1} p="$4">
          <YStack gap="$3">
            <Text fontSize="$7" fontWeight="700" color="$color">
              {selectedArticle.title}
            </Text>
            <XStack gap="$4">
              <XStack ai="center" gap="$1">
                <Newspaper size="$1" color="$gray10" />
                <Text fontSize="$3" color="$gray10">
                  {selectedArticle.source}
                </Text>
              </XStack>
              <XStack ai="center" gap="$1">
                <Clock size="$1" color="$gray10" />
                <Text fontSize="$3" color="$gray10">
                  {format(new Date(selectedArticle.pubDate), 'MMMM d, yyyy h:mm a')}
                </Text>
              </XStack>
              {selectedArticle.creator && (
                <XStack ai="center" gap="$1">
                  <User size="$1" color="$gray10" />
                  <Text fontSize="$3" color="$gray10">
                    {selectedArticle.creator}
                  </Text>
                </XStack>
              )}
            </XStack>
            <Paragraph fontSize="$4" color="$gray12" lineHeight="$5">
              {selectedArticle.content || selectedArticle.description || 'No content available.'}
            </Paragraph>
          </YStack>
        </ScrollView>
      </YStack>
    );
  }

  return (
    <YStack f={1} bg="$background">
      <YStack p="$3" gap="$3" borderBottomWidth={1} borderBottomColor="$gray4">
        <H4 fontSize="$7" fontWeight="700" color="$color">
          Business News
        </H4>
        <XStack gap="$2" ai="center">
          <Input
            f={1}
            placeholder="Search news..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={Search}
            size="$3"
            borderRadius="$5"
            bg="$gray2"
            borderWidth={0}
            p="$2"
            fontSize="$4"
          />
        </XStack>
        <XStack gap="$2" flexWrap="wrap">
          {(['all', 'Gleaner', 'Observer'] as const).map((source) => (
            <Button
              key={source}
              onPress={() => setSelectedSource(source)}
              bg={selectedSource === source ? '$blue10' : '$gray3'}
              color={selectedSource === source ? '$white' : '$gray11'}
              size="$2"
              borderRadius="$10"
              px="$3"
              animation="quick"
              hoverStyle={{ bg: selectedSource === source ? '$blue11' : '$gray4' }}
              pressStyle={{ scale: 0.95 }}
            >
              <Text fontSize="$3" fontWeight="500">
                {source === 'all' ? 'All' : source}
              </Text>
            </Button>
          ))}
        </XStack>
      </YStack>

      <ScrollView
        f={1}
        contentContainerStyle={{ p: '$3' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <YStack gap="$3">
          {summary && (
            <Card
              p="$3"
              bg="$gray2"
              borderRadius="$5"
              shadowColor="$gray5"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={4}
            >
              <XStack ai="center" jc="space-between" mb="$2">
                <XStack ai="center" gap="$2">
                  <BarChart size="$1" color="$blue10" />
                  <Text fontSize="$4" fontWeight="600" color="$color">
                    News Summary
                  </Text>
                </XStack>
                <Button
                  icon={isPlaying ? VolumeX : Volume2}
                  size="$2"
                  circular
                  chromeless
                  disabled={summaryLoading}
                  hoverStyle={{ bg: '$gray3' }}
                  pressStyle={{ scale: 0.95 }}
                />
              </XStack>
              <Paragraph fontSize="$3" color="$gray11" lineHeight="$4">
                {summary}
              </Paragraph>
            </Card>
          )}

          {filteredNews.map((item, index) => (
            <Card
              key={index}
              onPress={() => setSelectedArticle(item)}
              animation="quick"
              hoverStyle={{ bg: '$gray2' }}
              pressStyle={{ scale: 0.98 }}
              bg="$background"
              borderRadius="$5"
              p="$3"
              shadowColor="$gray5"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={4}
            >
              <YStack gap="$2">
                <XStack ai="center" jc="space-between">
                  <Text
                    color={item.source === 'Gleaner' ? '$blue10' : '$orange10'}
                    fontSize="$3"
                    fontWeight="600"
                  >
                    {item.source}
                  </Text>
                  <Text fontSize="$3" color="$gray10">
                    {format(new Date(item.pubDate), 'MMM d, yyyy')}
                  </Text>
                </XStack>
                <Text fontSize="$5" fontWeight="600" color="$color" numberOfLines={2}>
                  {item.title}
                </Text>
                {item.description && (
                  <Paragraph fontSize="$3" color="$gray11" numberOfLines={2} lineHeight="$4">
                    {item.description}
                  </Paragraph>
                )}
                {item.creator && (
                  <XStack ai="center" gap="$1">
                    <User size="$1" color="$gray10" />
                    <Text fontSize="$3" color="$gray10">
                      {item.creator}
                    </Text>
                  </XStack>
                )}
              </YStack>
            </Card>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}