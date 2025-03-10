import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RefreshControl, Animated, ScrollView as RNScrollView } from 'react-native';
import { Accordion, Square, Button, XStack, YStack, Text, Input, ScrollView, Spinner, H4, Paragraph, styled, useTheme } from 'tamagui';
import {
  Search, Newspaper, BarChart, Volume2, VolumeX, Share2, Bookmark, Filter, ChevronDown, RefreshCw
} from '@tamagui/lucide-icons';
import { format } from 'date-fns';
import { newsApi, NewsItem } from '@/api/newsApi';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Share } from 'react-native';
import { NewsCard } from '@/components/NewsCard';
import { ArticleDetail } from '../components/ArticleDetail';

// Styled Components with Dark Mode Variants
const ITEMS_PER_PAGE = 10;
const AnimatedYStack = Animated.createAnimatedComponent(YStack);

const NewsContainer = styled(YStack, {
  name: 'NewsContainer',
  flex: 1,
  backgroundColor: '$background',
  paddingTop: 0,
  variants: {
    dark: {
      true: { backgroundColor: '$gray1Dark' },
    },
  } as const,
});

const StyledScrollView = styled(ScrollView, {
  name: 'StyledScrollView',
  backgroundColor: '$background',
  variants: {
    dark: {
      true: { backgroundColor: '$gray1Dark' },
    },
  } as const,
});

const TopBar = styled(XStack, {
  name: 'TopBar',
  height: 56,
  paddingHorizontal: '$4',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '$background',
  variants: {
    dark: {
      true: { backgroundColor: '$gray1Dark' },
    },
  } as const,
});




const StyledAccordion = styled(Accordion, {
  name: 'StyledAccordion',
  backgroundColor: '$blue2',
  borderRadius: '$6',
  overflow: 'hidden',
  variants: {
    dark: {
      true: { backgroundColor: '$blue9' },
    },
  } as const,
});

const SourceButton = styled(Button, {
  name: 'SourceButton',
  borderRadius: '$6',
  pressStyle: { opacity: 0.8, scale: 0.98 },
});


const LoadingScreen = ({ fetchNews }) => {
  const theme = useTheme();
  const isDark = theme.name === 'dark';
  
  return (
    <NewsContainer dark={isDark} justifyContent="center" alignItems="center" space="$4">
      {/* Main animation container */}
      <YStack 
        animation="bouncy" 
        enterStyle={{ scale: 0.8, opacity: 0 }}
        scale={1}
        opacity={1}
        space="$6"
        width="100%"
        alignItems="center"
        padding="$4"
      >
        {/* Animated logo container */}
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
          pressStyle={{ scale: 0.97 }}
        >
          <Newspaper 
            size="$3" 
            color="$background" 
            animation="pulse" 
            animateOnly={['rotate', 'scale']}
            rotate="360deg" 
            scale={1.1}
            animationDuration={2200} 
          />
        </YStack>
        
        {/* Title and subtitle with staggered animations */}
        <YStack space="$3" alignItems="center">
          <Text 
            fontSize="$7" 
            fontWeight="800" 
            color="$color" 
            animation="quick" 
            opacity={1} 
            enterStyle={{ opacity: 0, scale: 0.9 }}
            scale={1}
          >
            Latest News
          </Text>
          <YStack space="$1" alignItems="center">
            <Text 
              fontSize="$4" 
              color="$gray10" 
              textAlign="center" 
              maxWidth={300}
              animation={{ type: 'timing', duration: 500, delay: 100 }}
              enterStyle={{ opacity: 0, y: 5 }}
              opacity={1}
              y={0}
            >
              Gathering today's top stories
            </Text>
            <Text 
              fontSize="$3" 
              color="$gray8" 
              textAlign="center" 
              maxWidth={280}
              animation={{ type: 'timing', duration: 500, delay: 200 }}
              enterStyle={{ opacity: 0, y: 5 }}
              opacity={1}
              y={0}
            >
              From trusted sources across Jamaica
            </Text>
          </YStack>
        </YStack>
        
        {/* Animated progress indicators */}
        <XStack space="$3" marginTop="$2">
          {[1, 2, 3, 4, 5].map((i) => (
            <YStack 
              key={i} 
              width={10} 
              height={10} 
              borderRadius={5} 
              backgroundColor="$blue10" 
              opacity={0.3}
              animation={{ 
                type: 'timing', 
                loop: true, 
                duration: 1200, 
                delay: i * 150 
              }}
              animateOnly={['opacity', 'scale']}
              enterStyle={{ opacity: 0.3, scale: 0.8 }}
              exitStyle={{ opacity: 0.3, scale: 0.8 }}
              opacity={1}
              scale={1}
            />
          ))}
        </XStack>
        
        {/* Loading tips with fade in/out animation */}
        <YStack 
          marginTop="$4" 
          padding="$3" 
          width="85%" 
          maxWidth={320}
          borderRadius="$6"
          backgroundColor={isDark ? "$gray3" : "$blue1"}
          borderWidth={1}
          borderColor={isDark ? "$gray4" : "$blue3"}
          animation={{ type: 'timing', duration: 700, delay: 300 }}
          enterStyle={{ opacity: 0, scale: 0.95 }}
          opacity={1}
          scale={1}
        >
          <XStack space="$2" alignItems="center" marginBottom="$2">
            <Square size="$1" backgroundColor="$blue10" borderRadius="$1" />
            <Text fontSize="$4" fontWeight="600" color="$blue10">Did you know?</Text>
          </XStack>
          <Text fontSize="$3" color="$gray11" lineHeight="$5">
            Our news summary is generated using AI to help you quickly catch up on the day's top stories.
          </Text>
        </YStack>
      </YStack>
      
      {/* Refresh button */}
      <Button 
        size="$4" 
        variant="outlined" 
        borderColor="$blue10" 
        color="$blue10" 
        icon={<RefreshCw size="$1" />}
        onPress={fetchNews} 
        marginTop="$6"
        animation="quick"
        enterStyle={{ opacity: 0, scale: 0.9, y: 10 }}
        opacity={1}
        scale={1}
        y={0}
      >
        Refresh Now
      </Button>
    </NewsContainer>
  );
};

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function NewsAggregator() {
  const theme = useTheme();
  const isDark = theme.name === 'dark'; // Sync with Tamagui’s theme state
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<'all' | 'Gleaner' | 'Observer'>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const [fadeAnim] = useState(new Animated.Value(0));
  const filterFadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<RNScrollView>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      const fetchedNews = await newsApi.fetchNews();
      setNews(fetchedNews);
      setVisibleItems(ITEMS_PER_PAGE);
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
  useEffect(() => {
    // Only fetch summary on initial load or on manual refresh
    if (news.length > 0 && (refreshing || summary === '')) {
      fetchSummary();
    }
  }, [fetchSummary, news, refreshing]);
  
  
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
        setVisibleItems(ITEMS_PER_PAGE);
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

  const visibleNews = useMemo(() =>
    filteredAndSortedNews.slice(0, visibleItems),
    [filteredAndSortedNews, visibleItems]
  );

  const handleScroll = useCallback(({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;

    if (isCloseToBottom && !isLoadingMore && visibleItems < filteredAndSortedNews.length) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleItems((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredAndSortedNews.length));
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, visibleItems, filteredAndSortedNews.length]);

  const renderTopBar = () => (
    <TopBar dark={isDark}>
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
            color="$color"
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
          icon={<Filter size="$1.5" />}
          size="$4"
          circular
          chromeless
          disabled={isFiltering}
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
      <StyledAccordion type="multiple" defaultValue={['summary']} dark={isDark}>
        <Accordion.Item value="summary">
          <Accordion.Trigger
            flexDirection="row"
            justifyContent="space-between"
            p="$3"
            backgroundColor={isDark ? '$blue9' : '$blue2'} // Explicitly set for trigger
            hoverStyle={{ backgroundColor: '$blue3' }}
            pressStyle={{ backgroundColor: '$blue4' }}
          >
            {({ open }: { open: boolean }) => (
              <>
                <XStack space="$2" ai="center">
                  <BarChart size="$1.5" color="$blue10" />
                  <Text fontSize="$6" fontWeight="700" color="$blue10">News Summary</Text>
                </XStack>
                <XStack space="$2" ai="center">
                {!summaryLoading && !summaryError && summary && (
    <>
      <Button
        icon={isPlaying ? <VolumeX size="$1" /> : <Volume2 size="$1" />}
        size="$3"
        circular
        chromeless
        onPress={(e) => { e.stopPropagation(); handleTextToSpeech(); }}
      />
      <Button
        icon={<RefreshCw size="$1" />}
        size="$3"
        circular
        chromeless
        onPress={(e) => { e.stopPropagation(); fetchSummary(); }}
      />
    </>
  )}
  <Square animation="quick" rotate={open ? '180deg' : '0deg'}>
    <ChevronDown size="$1" />
  </Square>
                </XStack>
              </>
            )}
          </Accordion.Trigger>
          <Accordion.Content animation="medium" p="$4" backgroundColor={isDark ? '$blue9' : '$blue2'}>
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
                // fetchSummary();
              }}
              bg={selectedSource === source ? '$blue9' : '$backgroundHover'}
              size="$3"
            >
              <Text color={selectedSource === source ? '$white' : '$color'} fontWeight={selectedSource === source ? '600' : '400'}>
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
<>

<LoadingScreen/>


</>    );
  }

  if (error) {
    return (
      <NewsContainer dark={isDark} justifyContent="center" alignItems="center" space="$4">
        <Text color="$red10">{error}</Text>
        <Button size="$4" icon={<RefreshCw />} onPress={fetchNews}>Retry</Button>
      </NewsContainer>
    );
  }

  return (
    <NewsContainer dark={isDark}>
      {selectedArticle ? (
        <ArticleDetail article={selectedArticle} bookmarkedArticles={bookmarkedArticles} toggleBookmark={toggleBookmark}
          shareArticle={shareArticle} onClose={() => setSelectedArticle(null)} />
      ) : (
        <>
          {renderTopBar()}
          <StyledScrollView
            ref={scrollViewRef}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            showsVerticalScrollIndicator={false}
            dark={isDark}
          >
            <YStack space="$4">
              {renderNewsSummary()}
              <YStack px="$4" space="$4">
                <AnimatedYStack style={{ opacity: filterFadeAnim, transform: [{ translateY: filterFadeAnim.interpolate({ inputRange: [0.5, 1], outputRange: [5, 0] }) }] }} space="$4">
                  {isFiltering && (
                    <XStack justifyContent="center" padding="$2">
                      <Spinner size="small" color="$blue10" />
                    </XStack>
                  )}
                  {visibleNews.map((item, index) => (
                    <NewsCard
                      key={`${item.source}-${item.title}-${index}`}
                      item={item}
                      onPress={setSelectedArticle}
                      bookmarkedArticles={bookmarkedArticles}
                      toggleBookmark={toggleBookmark}
                      shareArticle={shareArticle}
                    />
                  ))}
                  {isLoadingMore && (
                    <XStack justifyContent="center" padding="$4">
                      <Spinner size="small" color="$blue10" />
                    </XStack>
                  )}
                  {visibleItems >= filteredAndSortedNews.length && filteredAndSortedNews.length > 0 && (
                    <Text textAlign="center" color="$gray9" fontSize="$3" padding="$4">
                      No more news to load
                    </Text>
                  )}
                </AnimatedYStack>
              </YStack>
            </YStack>
          </StyledScrollView>
        </>
      )}
    </NewsContainer>
  );
}