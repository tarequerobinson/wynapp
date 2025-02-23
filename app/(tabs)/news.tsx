import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RefreshControl, Animated, Pressable } from 'react-native';
import { Accordion, Square, useThemeName, Button, XStack, YStack, Text, Input, ScrollView, Spinner, H4, Paragraph, styled, useTheme } from 'tamagui';
import {
  Search, Newspaper, Clock, User, ArrowLeft, BarChart, Volume2, VolumeX, Share2, Bookmark, BookmarkCheck, Filter, Calendar, ChevronLeft, ChevronRight, ChevronDown, RefreshCw
} from '@tamagui/lucide-icons';
import { format } from 'date-fns';
import { newsApi, NewsItem } from '@/api/newsApi';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Share } from 'react-native';
import { useColorScheme } from 'react-native';
import { ArticleDetail } from '../components/ArticleDetail';

// NewsCard Component
interface NewsCardProps {
  item: NewsItem;
  onPress: (item: NewsItem) => void;
  bookmarkedArticles: Set<string>;
  toggleBookmark: (articleId: string) => void;
  shareArticle: (article: NewsItem) => void;
}

export function NewsCard({ item, onPress, bookmarkedArticles, toggleBookmark, shareArticle }: NewsCardProps) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
    ]).start();
  }, []);

  const handleCardPress = useCallback(() => onPress(item), [item, onPress]);
  const handleBookmark = useCallback((e) => { e.stopPropagation(); toggleBookmark(item.title); }, [item.title, toggleBookmark]);
  const handleShare = useCallback((e) => { e.stopPropagation(); shareArticle(item); }, [item, shareArticle]);

  const sourceColor = item.source === 'Gleaner' ? '$blue10' : '$red10';
  const sourceBackgroundColor = item.source === 'Gleaner' ? '$blue3' : '$red3';

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <YStack
        backgroundColor="$backgroundStrong"
        borderRadius="$4"
        borderWidth={1}
        borderColor="$borderColor"
        marginVertical="$2"
        overflow="hidden"
        animation="quick"
        enterStyle={{ opacity: 0, y: 10 }}
        pressStyle={{ scale: 0.98 }}
        onPress={handleCardPress}
      >
        <XStack minHeight={140} flex={1}>
          <YStack 
            width={120} 
            backgroundColor={item.imageUrl ? undefined : '$gray3'}
            justifyContent="center"
            alignItems="center"
            animation="lazy"
            enterStyle={{ scale: 0.9, opacity: 0 }}
          >
            {item.imageUrl ? (
              <Animated.Image
                source={{ uri: item.imageUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Text color="$gray8" fontSize="$4" fontWeight="600" textAlign="center" padding="$2">
                No Image
              </Text>
            )}
          </YStack>
          <YStack flex={1} padding="$3" space="$2" animation="lazy" enterStyle={{ x: 10, opacity: 0 }}>
            <XStack justifyContent="space-between" alignItems="center">
              <YStack backgroundColor={sourceBackgroundColor} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                <Text color={sourceColor} fontSize="$2" fontWeight="600">{item.source}</Text>
              </YStack>
              <XStack alignItems="center" space="$1">
                <Clock size="$1" color="$gray9" />
                <Text fontSize="$2" color="$gray9">{format(new Date(item.pubDate), 'MMM d, yyyy')}</Text>
              </XStack>
            </XStack>
            <Text fontSize="$5" fontWeight="700" color="$color" lineHeight="$4" numberOfLines={2} flex={1}>
              {item.title}
            </Text>
            {item.description && (
              <Text fontSize="$3" color="$gray10" lineHeight="$3" numberOfLines={3} flex={1}>
                {item.description}
              </Text>
            )}
            <XStack alignItems="center" justifyContent="space-between" marginTop="$1">
              {item.creator && (
                <XStack alignItems="center" space="$1" flex={1}>
                  <User size="$1" color="$gray9" />
                  <Text fontSize="$2" color="$gray9" numberOfLines={1}>{item.creator}</Text>
                </XStack>
              )}
              <XStack space="$2">
                <Button
                  icon={bookmarkedArticles.has(item.title) ? <BookmarkCheck size="$1" color="$blue10" /> : <Bookmark size="$1" color="$gray9" />}
                  size="$2" circular backgroundColor="transparent" borderWidth={1} borderColor="$gray5"
                  onPress={handleBookmark} hoverStyle={{ backgroundColor: '$gray3' }} pressStyle={{ scale: 0.95 }}
                  animateOnly={['transform', 'backgroundColor']} animation="quick"
                  accessibilityLabel={bookmarkedArticles.has(item.title) ? "Remove bookmark" : "Add bookmark"}
                />
                <Button
                  icon={<Share2 size="$1" color="$gray9" />} size="$2" circular backgroundColor="transparent"
                  borderWidth={1} borderColor="$gray5" onPress={handleShare} hoverStyle={{ backgroundColor: '$gray3' }}
                  pressStyle={{ scale: 0.95 }} animateOnly={['transform', 'backgroundColor']} animation="quick"
                  accessibilityLabel="Share article"
                />
              </XStack>
            </XStack>
          </YStack>
        </XStack>
      </YStack>
    </Animated.View>
  );
}

// NewsAggregator Component
const ITEMS_PER_PAGE = 10;
const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const StyledScrollView = styled(ScrollView, { name: 'StyledScrollView', backgroundColor: '$backgroundStrong' });
const NewsContainer = styled(YStack, { name: 'NewsContainer', flex: 1, backgroundColor: '$backgroundStrong', paddingTop: 0 });
const TopBar = styled(XStack, { name: 'TopBar', height: 56, paddingHorizontal: '$4', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '$backgroundTransparent' });
const StyledAccordion = styled(Accordion, { name: 'StyledAccordion', backgroundColor: '$blue2', borderRadius: '$6', overflow: 'hidden' });
const SourceButton = styled(Button, { name: 'SourceButton', borderRadius: '$6', pressStyle: { opacity: 0.8, scale: 0.98 } });

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function NewsAggregator() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
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
  const [isFiltering, setIsFiltering] = useState(false);

  const [fadeAnim] = useState(new Animated.Value(0));
  const filterFadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      const fetchedNews = await newsApi.fetchNews();
      setNews(fetchedNews);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fadeAnim]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      if (!news || news.length === 0) {
        setSummary('No news available to summarize.');
        return;
      }
      const filteredNewsForSummary = filteredAndSortedNews.slice(0, 50);
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

  useEffect(() => { fetchNews(); }, [fetchNews]);
  useEffect(() => { fetchSummary(); }, [fetchSummary, filteredAndSortedNews]);

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
        onDone: () => { setIsPlaying(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
        onError: () => { setIsPlaying(false); setSummaryError('Text-to-speech failed'); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); },
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isPlaying, summary]);

  const handleFilter = useCallback(
    debounce((newSortOrder) => {
      setIsFiltering(true);
      Animated.timing(filterFadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setSortOrder(newSortOrder);
        Animated.timing(filterFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => setIsFiltering(false));
      });
    }, 200),
    [filterFadeAnim]
  );

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

  const paginatedNews = useMemo(() =>
    filteredAndSortedNews.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    ),
    [filteredAndSortedNews, currentPage]
  );
  const totalPages = Math.ceil(filteredAndSortedNews.length / ITEMS_PER_PAGE);

  const renderTopBar = () => (
    <TopBar>
      <XStack space="$3" ai="center" flex={1}>
        {isSearchVisible ? (
          <Input
            flex={1} placeholder="Search news..." value={searchQuery} onChangeText={setSearchQuery}
            autoFocus onBlur={() => setIsSearchVisible(false)} size="$4" borderRadius="$6" bg="$backgroundHover"
          />
        ) : (
          <>
            <Button icon={<Search size="$1.5" />} size="$4" circular chromeless onPress={() => setIsSearchVisible(true)} />
            <H4 color="$color" fontSize="$6" fontWeight="800">News</H4>
          </>
        )}
      </XStack>
      <XStack space="$2">
        <Button
          icon={<Filter size="$1.5" />} size="$4" circular chromeless disabled={isFiltering}
          opacity={isFiltering ? 0.5 : 1}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleFilter(sortOrder === 'newest' ? 'oldest' : 'newest');
          }}
        />
      </XStack>
    </TopBar>
  );

  const renderNewsSummary = () => (
    <YStack p="$4" space="$3">
      <StyledAccordion type="multiple" defaultValue={['summary']}>
        <Accordion.Item value="summary">
          <Accordion.Trigger
            flexDirection="row" justifyContent="space-between" p="$3" backgroundColor="$blue2"
            hoverStyle={{ backgroundColor: '$blue3' }} pressStyle={{ backgroundColor: '$blue4' }}
          >
            {({ open }: { open: boolean }) => (
              <>
                <XStack space="$2" ai="center">
                  <BarChart size="$1.5" color="$blue10" />
                  <Text fontSize="$6" fontWeight="700" color="$blue10">News Summary</Text>
                </XStack>
                <XStack space="$2" ai="center">
                  {!summaryLoading && !summaryError && summary && (
                    <Button
                      icon={isPlaying ? <VolumeX size="$1" /> : <Volume2 size="$1" />}
                      size="$3" circular chromeless
                      onPress={(e) => { e.stopPropagation(); handleTextToSpeech(); }}
                    />
                  )}
                  <Square animation="quick" rotate={open ? '180deg' : '0deg'}>
                    <ChevronDown size="$1" />
                  </Square>
                </XStack>
              </>
            )}
          </Accordion.Trigger>
          <Accordion.Content animation="medium" p="$4" backgroundColor="$blue2">
            {summaryLoading ? (
              <XStack ai="center" space="$2">
                <Spinner size="small" color="$blue10" />
                <Paragraph fontSize="$4" color="$gray11">Generating summary...</Paragraph>
              </XStack>
            ) : summaryError ? (
              <Paragraph fontSize="$4" color="$red10">{summaryError}</Paragraph>
            ) : (
              <Paragraph fontSize="$4" color="$gray11" mb="$4">{summary || 'No summary available'}</Paragraph>
            )}
          </Accordion.Content>
        </Accordion.Item>
      </StyledAccordion>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack space="$2">
          {(['all', 'Gleaner', 'Observer'] as const).map((source) => (
            <SourceButton
              key={source}
              onPress={() => {
                setSelectedSource(source);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                fetchSummary();
              }}
              bg={selectedSource === source ? '$blue9' : '$backgroundHover'}
              size="$3"
            >
              <Text color={selectedSource === source ? 'white' : '$color'} fontWeight={selectedSource === source ? '600' : '400'}>
                {source === 'all' ? 'All Sources' : source}
              </Text>
            </SourceButton>
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={isDark ? '$gray1Dark' : '$gray1Light'} space="$4">
        <YStack animation="bouncy" scale={1} enterStyle={{ scale: 0 }} width={60} height={60} borderRadius={30}
          backgroundColor="$blue10" justifyContent="center" alignItems="center">
          <Newspaper size="$2" color={isDark ? '$gray1Dark' : '$white'} animation="pulse" animateOnly={['rotate']}
            rotate="360deg" animationDuration={2000} />
        </YStack>
        <YStack space="$2" alignItems="center">
          <Text fontSize="$6" fontWeight="600" color={isDark ? '$gray12' : '$gray11'} animation="quick" opacity={1} enterStyle={{ opacity: 0 }}>
            Loading News
          </Text>
          <Text fontSize="$3" color={isDark ? '$gray10' : '$gray8'} textAlign="center" maxWidth={240}>
            Fetching the latest news updates...
          </Text>
        </YStack>
        <XStack space="$2">
          {[1, 2, 3].map((i) => (
            <YStack key={i} width={8} height={8} borderRadius={4} backgroundColor="$blue10" animation="lazy" opacity={0.3}
              animateOnly={['opacity']} animation={{ type: 'timing', loop: true, duration: 800, delay: i * 200 }}
              enterStyle={{ opacity: 0.3 }} exitStyle={{ opacity: 0.3 }} opacity={1} />
          ))}
        </XStack>
        <Button size="$3" variant="outlined" borderColor="$blue10" color="$blue10" icon={<RefreshCw size="$1" />}
          onPress={fetchNews} marginTop="$4">Refresh Now</Button>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={isDark ? '$gray1Dark' : '$gray1Light'} space="$4">
        <Text color="$red10">{error}</Text>
        <Button size="$4" icon={<RefreshCw />} onPress={fetchNews}>Retry</Button>
      </YStack>
    );
  }

  return (
    <NewsContainer>
      {selectedArticle ? (
        <ArticleDetail article={selectedArticle} bookmarkedArticles={bookmarkedArticles} toggleBookmark={toggleBookmark}
          shareArticle={shareArticle} onClose={() => setSelectedArticle(null)} />
      ) : (
        <>
          {renderTopBar()}
          <StyledScrollView ref={scrollViewRef} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            scrollEventThrottle={16}>
            <YStack space="$4">
              {renderNewsSummary()}
              <YStack px="$4" space="$4">
                {error ? (
                  <Card p="$4" bg="$red3Dark"><Text color="$red10">{error}</Text></Card>
                ) : (
                  <>
                    <AnimatedYStack style={{ opacity: filterFadeAnim, transform: [{ translateY: filterFadeAnim.interpolate({ inputRange: [0.5, 1], outputRange: [5, 0] }) }] }} space="$4">
                      {isFiltering && (
                        <XStack justifyContent="center" padding="$2">
                          <Spinner size="small" color="$blue10" />
                        </XStack>
                      )}
                      {paginatedNews.map((item, index) => (
                        <NewsCard key={`${item.source}-${item.title}-${index}`} item={item} onPress={setSelectedArticle}
                          bookmarkedArticles={bookmarkedArticles} toggleBookmark={toggleBookmark} shareArticle={shareArticle} />
                      ))}
                    </AnimatedYStack>
                    {totalPages > 1 && (
                      <XStack ai="center" jc="center" space="$3" py="$4">
                        <Button icon={<ChevronLeft size="$1" />} disabled={currentPage === 1 || isFiltering}
                          onPress={() => setCurrentPage((prev) => prev - 1)} />
                        <Text>{currentPage} / {totalPages}</Text>
                        <Button icon={<ChevronRight size="$1" />} disabled={currentPage === totalPages || isFiltering}
                          onPress={() => setCurrentPage((prev) => prev + 1)} />
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