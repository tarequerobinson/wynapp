import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RefreshControl, Animated } from 'react-native';
import {
  YStack,
  XStack,
  Card,
  Text,
  Input,
  Button,
  ScrollView,
  Spinner,
  H4,
  Paragraph,
  Theme,
  styled,
  Image,
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
  Share2,
  Bookmark,
  BookmarkCheck,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from '@tamagui/lucide-icons';
import { format } from 'date-fns';
import { newsApi, NewsItem } from '@/api/newsApi';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech'; // Added for text-to-speech
import { Share } from 'react-native';

const ITEMS_PER_PAGE = 10;

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

const StyledScrollView = styled(ScrollView, {
  name: 'StyledScrollView',
  backgroundColor: '$backgroundStrong',
});

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const NewsContainer = styled(YStack, {
  name: 'NewsContainer',
  flex: 1,
  backgroundColor: '$backgroundStrong',
  paddingTop: 0,
});

const TopBar = styled(XStack, {
  name: 'TopBar',
  height: 56,
  paddingHorizontal: '$4',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '$backgroundTransparent',
});

export default function NewsAggregator() {
  // State Management
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]); // Ensure initialized as empty array
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<'all' | 'Gleaner' | 'Observer'>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [headerAnim] = useState(new Animated.Value(0));
  const scrollViewRef = useRef<ScrollView>(null);

  const headerHeight = headerAnim.interpolate({
    inputRange: [0, 120],
    outputRange: [120, 60],
    extrapolate: 'clamp',
  });

  const headerOpacity = headerAnim.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Data Fetching
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedNews = await newsApi.fetchNews();
      setNews(fetchedNews);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fadeAnim]);

  // Summary Fetching or Generation (Updated to use fetchNewsSummary)
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      // Ensure news is available before generating summary
      if (!news || news.length === 0) {
        setSummary('No news available to summarize.');
        return;
      }

      // Use fetchNewsSummary from newsApi with filtered news
      const filteredNewsForSummary = filteredAndSortedNews.slice(0, 50); // Limit to 50 articles for summary
      const summaryText = await newsApi.fetchNewsSummary(filteredNewsForSummary);
      setSummary(summaryText);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Failed to generate summary');
      setSummary('Unable to generate summary at this time.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSummaryLoading(false);
    }
  }, [news, filteredAndSortedNews]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, filteredAndSortedNews]); // Added filteredAndSortedNews as dependency

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchNews();
    fetchSummary();
  }, [fetchNews, fetchSummary]);

  const toggleBookmark = useCallback((articleId: string) => {
    setBookmarkedArticles((prev) => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(articleId)) {
        newBookmarks.delete(articleId);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        newBookmarks.add(articleId);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      return newBookmarks;
    });
  }, []);

  const shareArticle = useCallback(async (article: NewsItem) => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.description}\n\nRead more: ${article.link}`,
        title: article.title,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  }, []);

  const handleTextToSpeech = useCallback(() => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (summary) {
      setIsPlaying(true);
      Speech.speak(summary, {
        language: 'en',
        pitch: 1.0,
        rate: 1.0,
        onDone: () => {
          setIsPlaying(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onError: () => {
          setIsPlaying(false);
          setSummaryError('Text-to-speech failed');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isPlaying, summary]);

  // Filtered and Sorted News
  const filteredAndSortedNews = useMemo(() => {
    let processed = news.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource = selectedSource === 'all' || item.source === selectedSource;
      return matchesSearch && matchesSource;
    });

    return processed.sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        : new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime()
    );
  }, [news, searchQuery, selectedSource, sortOrder]);

  const paginatedNews = filteredAndSortedNews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredAndSortedNews.length / ITEMS_PER_PAGE);

  const renderTopBar = () => (
    <TopBar>
      <XStack space="$3" ai="center" flex={1}>
        {isSearchVisible ? (
          <Input
            flex={1}
            placeholder="Search news..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            onBlur={() => setIsSearchVisible(false)}
            size="$4"
            borderRadius="$6"
            bg="$backgroundHover"
          />
        ) : (
          <>
            <Button
              icon={<Search size="$1.5" />}
              size="$4"
              circular
              chromeless
              onPress={() => setIsSearchVisible(true)}
            />
            <H4 color="$color" fontSize="$6" fontWeight="800">
              News
            </H4>
          </>
        )}
      </XStack>
      <XStack space="$2">
        <Button
          icon={<Filter size="$1.5" />}
          size="$4"
          circular
          chromeless
          onPress={() => {
            setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        />
      </XStack>
    </TopBar>
  );

  const renderNewsSummary = () => (
    <YStack p="$4" space="$3">
      <XStack ai="center" space="$2">
        <BarChart size="$1.5" color="$blue10" />
        <Text fontSize="$6" fontWeight="700" color="$blue10">
          News Summary
        </Text>
      </XStack>
      <Card animation="bouncy" bg="$backgroundHover" p="$4" borderRadius="$6">
        <XStack ai="center" jc="space-between" mb="$2">
          {summaryLoading ? (
            <XStack ai="center" space="$2">
              <Spinner size="small" color="$blue10" />
              <Paragraph fontSize="$4" color="$gray11">
                Generating summary...
              </Paragraph>
            </XStack>
          ) : summaryError ? (
            <Paragraph fontSize="$4" color="$red10">
              {summaryError}
            </Paragraph>
          ) : (
            <Paragraph fontSize="$4" color="$gray11">
              {summary || 'No summary available'}
            </Paragraph>
          )}
          {!summaryLoading && !summaryError && summary && (
            <Button
              icon={isPlaying ? <VolumeX size="$1" /> : <Volume2 size="$1" />}
              size="$3"
              circular
              chromeless
              onPress={handleTextToSpeech}
            />
          )}
        </XStack>
      </Card>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack space="$2" py="$2">
          {(['all', 'Gleaner', 'Observer'] as const).map((source) => (
            <Button
              key={source}
              onPress={() => {
                setSelectedSource(source);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                fetchSummary(); // Refresh summary when source changes
              }}
              bg={selectedSource === source ? '$blue9' : '$backgroundHover'}
              size="$3"
              borderRadius="$6"
            >
              {source === 'all' ? 'All Sources' : source}
            </Button>
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );

  const renderNewsCard = (item: NewsItem, index: number) => (
    <Card
      key={`${item.source}-${item.title}-${index}`}
      animation="bouncy"
      enterStyle={{ opacity: 0, y: 20 }}
      bg="$background"
      borderRadius="$4"
      onPress={() => {
        setSelectedArticle(item);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
    >
      <YStack>
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        )}
        <YStack p="$4" space="$3">
          <XStack ai="center" space="$2">
            <Text color={item.source === 'Gleaner' ? '$blue10' : '$red10'} fontSize="$3">
              {item.source}
            </Text>
            <Text color="$gray10" fontSize="$3">
              • {format(new Date(item.pubDate), 'MMM d')}
            </Text>
          </XStack>
          <Text fontSize="$5" fontWeight="700" numberOfLines={2}>
            {item.title}
          </Text>
          {item.description && (
            <Paragraph fontSize="$4" color="$gray11" numberOfLines={2}>
              {item.description}
            </Paragraph>
          )}
          <XStack ai="center" jc="space-between">
            {item.creator && (
              <XStack ai="center" space="$1">
                <User size="$1" color="$gray10" />
                <Text fontSize="$3" color="$gray10">{item.creator}</Text>
              </XStack>
            )}
            <XStack space="$2">
              <Button
                icon={bookmarkedArticles.has(item.title) ? <BookmarkCheck size="$1" /> : <Bookmark size="$1" />}
                size="$3"
                circular
                chromeless
                onPress={(e) => {
                  e.stopPropagation();
                  toggleBookmark(item.title);
                }}
              />
              <Button
                icon={<Share2 size="$1" />}
                size="$3"
                circular
                chromeless
                onPress={(e) => {
                  e.stopPropagation();
                  shareArticle(item);
                }}
              />
            </XStack>
          </XStack>
        </YStack>
      </YStack>
    </Card>
  );

  const renderArticleDetail = () => {
    if (!selectedArticle) return null;
    return (
      <YStack f={1} bg="$backgroundStrong">
        <XStack p="$4" ai="center" jc="space-between">
          <Button
            icon={<ArrowLeft size="$1" />}
            size="$4"
            circular
            onPress={() => {
              setSelectedArticle(null);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          />
          <XStack space="$3">
            <Button
              icon={bookmarkedArticles.has(selectedArticle.title) ? <BookmarkCheck size="$1" /> : <Bookmark size="$1" />}
              size="$4"
              circular
              onPress={() => toggleBookmark(selectedArticle.title)}
            />
            <Button
              icon={<Share2 size="$1" />}
              size="$4"
              circular
              onPress={() => shareArticle(selectedArticle)}
            />
          </XStack>
        </XStack>
        <ScrollView>
          <YStack p="$4" space="$4">
            <Text fontSize="$7" fontWeight="800">{selectedArticle.title}</Text>
            <XStack space="$3" flexWrap="wrap">
              <Text color={selectedArticle.source === 'Gleaner' ? '$blue10' : '$red10'}>
                {selectedArticle.source}
              </Text>
              <Text color="$gray10">
                {format(new Date(selectedArticle.pubDate), 'MMMM d, yyyy')}
              </Text>
              {selectedArticle.creator && (
                <Text color="$gray10">{selectedArticle.creator}</Text>
              )}
            </XStack>
            <Paragraph fontSize="$4" lineHeight="$6">
              {selectedArticle.content || selectedArticle.description}
            </Paragraph>
          </YStack>
        </ScrollView>
      </YStack>
    );
  };

  // Main Render
  return (
    <NewsContainer>
      {selectedArticle ? (
        renderArticleDetail()
      ) : (
        <>
          {renderTopBar()}
          <StyledScrollView
            ref={scrollViewRef}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            scrollEventThrottle={16}
          >
            <YStack space="$4">
              {renderNewsSummary()}
              <YStack px="$4" space="$4">
                {loading ? (
                  <YStack ai="center" jc="center" h={300}>
                    <Spinner size="large" />
                  </YStack>
                ) : error ? (
                  <Card p="$4" bg="$red3Dark">
                    <Text color="$red10">{error}</Text>
                  </Card>
                ) : (
                  <>
                    <AnimatedYStack style={{ opacity: fadeAnim }} space="$4">
                      {paginatedNews.map((item, index) => renderNewsCard(item, index))}
                    </AnimatedYStack>
                    {totalPages > 1 && (
                      <XStack ai="center" jc="center" space="$3" py="$4">
                        <Button
                          icon={<ChevronLeft size="$1" />}
                          disabled={currentPage === 1}
                          onPress={() => setCurrentPage((prev) => prev - 1)}
                        />
                        <Text>{currentPage} / {totalPages}</Text>
                        <Button
                          icon={<ChevronRight size="$1" />}
                          disabled={currentPage === totalPages}
                          onPress={() => setCurrentPage((prev) => prev + 1)}
                        />
                      </XStack>
                    )}
                  </>
                )}
              </YStack>
            </YStack>
          </StyledScrollView>
        </>
      )}
    </NewsContainer>
  );
}