import { useCallback, useState, useEffect, useRef } from 'react';
import { YStack, XStack, Text, Paragraph, ScrollView, Button, useTheme } from 'tamagui';
import { 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  ArrowUp, 
  Type, 
  Clock, 
  MessageCircle
} from '@tamagui/lucide-icons';
import { Animated, Dimensions, PanResponder, TouchableOpacity, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { NewsItem } from '@/api/newsApi';
// import Slider from '@react-native-community/slider';
import { TextInput } from 'react-native';



// Enhanced types
interface ArticleDetailProps {
  article: NewsItem;
  bookmarkedArticles: Set<string>;
  toggleBookmark: (articleId: string) => void;
  shareArticle: (article: NewsItem) => void;
  onClose: () => void;
  nextArticle?: NewsItem;
  prevArticle?: NewsItem;
  onNavigateToArticle?: (article: NewsItem) => void;
}

interface Reaction {
  emoji: string;
  count: number;
  selected: boolean;
}

// Styled components (using const for better performance)
const ProgressBar = ({ width }: { width: Animated.Value }) => (
  <Animated.View
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      height: 3,
      backgroundColor: '#3b82f6',
      width,
      zIndex: 100,
    }}
  />
);

const FloatingButton = ({ onPress, icon, accessibilityLabel, accessibilityHint }: any) => (
  <Button
    icon={icon}
    size="$4"
    theme="blue"
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
    style={{
      position: 'absolute',
      bottom: 20,
      right: 20,
      borderRadius: 999,
      zIndex: 100,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    }}
  />
);

const RelatedArticleCard = ({ onPress, children }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      padding: 12,
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.05)',
      marginBottom: 10,
    }}
  >
    {children}
  </TouchableOpacity>
);

const ReactionButton = ({ onPress, selected, children, accessibilityLabel }: any) => (
  <Button
    onPress={onPress}
    pressStyle={{ scale: 0.95 }}
    theme={selected ? 'blue' : undefined}
    accessibilityLabel={accessibilityLabel}
    style={{
      borderRadius: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: '$borderColor',
      marginRight: 8,
      marginBottom: 4,
    }}
  >
    {children}
  </Button>
);

export function ArticleDetail({ 
  article, 
  bookmarkedArticles, 
  toggleBookmark, 
  shareArticle, 
  onClose,
  nextArticle,
  prevArticle,
  onNavigateToArticle 
}: ArticleDetailProps) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showTextControls, setShowTextControls] = useState(false);
  const [fontSize, setFontSize] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    { id: 1, author: 'User123', text: 'Great article, thanks for sharing!', timestamp: new Date().toISOString() },
    { id: 2, author: 'NewsReader', text: 'I found this perspective interesting.', timestamp: new Date().toISOString() }
  ]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [totalScrollLength, setTotalScrollLength] = useState(1);
  const [showReaderMode, setShowReaderMode] = useState(false);
  const [showSharingPreview, setShowSharingPreview] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([
    { emoji: '👍', count: 127, selected: false },
    { emoji: '❤️', count: 89, selected: false },
    { emoji: '😲', count: 42, selected: false }
  ]);
  const [relatedArticles, setRelatedArticles] = useState([
    { id: '1', title: 'Related: Further developments in this story', source: 'Gleaner', pubDate: new Date().toISOString() },
    { id: '2', title: 'Opinion: What this means for the future', source: 'Observer', pubDate: new Date().toISOString() }
  ]);
  
  // Refs for performance
  const scrollViewRef = useRef<ScrollView>(null);
  const progressBarWidthAnim = useRef(new Animated.Value(0)).current;
  
  // Estimate reading time (250 words per minute)
  const estimateReadingTime = useCallback((text: string) => {
    const wordCount = text?.split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(wordCount / 250));
  }, []);
  
  const readingTimeMinutes = estimateReadingTime(article.content || article.description || '');
  
  // Handle bookmarking with haptic feedback
  const handleBookmark = useCallback(() => {
    toggleBookmark(article.title);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [article.title, toggleBookmark]);

  // Handle sharing with preview
  const handleShare = useCallback(() => {
    setShowSharingPreview(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);
  
  const confirmShare = useCallback(() => {
    setShowSharingPreview(false);
    shareArticle(article);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [article, shareArticle]);
  
  // Scroll handling - optimized with useCallback
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const height = contentSize.height - layoutMeasurement.height;
    
    setScrollPosition(scrollY);
    setTotalScrollLength(height);
    setShowBackToTop(scrollY > 300);
    
    // Update progress bar
    const progress = Math.min(Math.max(scrollY / height, 0), 1);
    progressBarWidthAnim.setValue(progress * Dimensions.get('window').width);
  }, [progressBarWidthAnim]);
  
  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);
  
  // Swipe gesture handling - optimized for mobile
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // More lenient for mobile - require less horizontal movement to trigger
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        // Reduced threshold for better mobile experience
        if (gestureState.dx > 80 && prevArticle && onNavigateToArticle) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          onNavigateToArticle(prevArticle);
        } else if (gestureState.dx < -80 && nextArticle && onNavigateToArticle) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          onNavigateToArticle(nextArticle);
        }
      },
    })
  ).current;
  
  // Toggle reaction with haptic feedback
  const toggleReaction = useCallback((index: number) => {
    setReactions(prev => prev.map((reaction, i) => {
      if (i === index) {
        const newSelected = !reaction.selected;
        return {
          ...reaction,
          count: newSelected ? reaction.count + 1 : reaction.count - 1,
          selected: newSelected
        };
      }
      return reaction;
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);
  
  // Add comment
  const addComment = useCallback(() => {
    if (commentText.trim()) {
      setComments(prev => [
        { 
          id: Date.now(), 
          author: 'You', 
          text: commentText.trim(), 
          timestamp: new Date().toISOString() 
        },
        ...prev
      ]);
      setCommentText('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [commentText]);
  
  // Reset image error state when article changes
  useEffect(() => {
    setImageError(false);
  }, [article.imageUrl]);
  
  // Calculate responsive dimensions for mobile
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const isSmallScreen = windowWidth < 375; // Extra small screens like iPhone SE
  
  // Adjust image dimensions based on screen size
  const imageHeight = isSmallScreen ? 200 : Math.min(300, windowHeight * 0.35);
  const imageWidth = windowWidth > 800 ? 800 : windowWidth - (isSmallScreen ? 20 : 40);
  
  // Adjust font size for small screens
  const titleFontSize = isSmallScreen ? '$7' : '$8';
  const metadataFontSize = isSmallScreen ? '$3' : '$4';
  
  return (
    <YStack
      flex={1}
      bg="$backgroundStrong"
      animation="quick"
      enterStyle={{ opacity: 0, y: 20 }}
      exitStyle={{ opacity: 0, y: -20 }}
      {...panResponder.panHandlers}
    >
      {/* Progress bar */}
      <ProgressBar width={progressBarWidthAnim} />
      
      {/* Header - optimized layout for mobile */}
      <XStack 
        p={isSmallScreen ? '$3' : '$4'} 
        ai="center" 
        jc="space-between" 
        borderBottomWidth={1} 
        borderBottomColor="$borderColor"
      >
        <Button
          icon={<ArrowLeft size={isSmallScreen ? '$1' : '$1.5'} />}
          size={isSmallScreen ? '$3' : '$4'}
          circular
          chromeless
          onPress={onClose}
          hoverStyle={{ backgroundColor: '$backgroundHover' }}
          pressStyle={{ scale: 0.95 }}
          accessibilityLabel="Back to news list"
          accessibilityHint="Returns to the list of news articles"
        />
        
        <XStack space={isSmallScreen ? '$2' : '$3'}>
          {/* <Button
            icon={<Type size={isSmallScreen ? '$1' : '$1.5'} />}
            size={isSmallScreen ? '$3' : '$4'}
            circular
            chromeless
            onPress={() => {
              setShowTextControls(!showTextControls);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            pressStyle={{ scale: 0.95 }}
            accessibilityLabel="Text size controls"
            accessibilityHint="Adjust the text size for better readability"
          /> */}
          
          <Button
            icon={<Clock size={isSmallScreen ? '$1' : '$1.5'} />}
            size={isSmallScreen ? '$3' : '$4'}
            circular
            chromeless
            onPress={() => {
              setShowReaderMode(!showReaderMode);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            pressStyle={{ scale: 0.95 }}
            accessibilityLabel={showReaderMode ? "Exit reader mode" : "Enter reader mode"}
            accessibilityHint={showReaderMode ? "Return to normal view" : "Focus on just the article content"}
          />
          
          <Button
            icon={bookmarkedArticles.has(article.title) ? 
              <BookmarkCheck size={isSmallScreen ? '$1' : '$1.5'} /> : 
              <Bookmark size={isSmallScreen ? '$1' : '$1.5'} />
            }
            size={isSmallScreen ? '$3' : '$4'}
            circular
            chromeless
            onPress={handleBookmark}
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            pressStyle={{ scale: 0.95 }}
            accessibilityLabel={bookmarkedArticles.has(article.title) ? "Remove bookmark" : "Add bookmark"}
            accessibilityHint={bookmarkedArticles.has(article.title) ? "Remove this article from your bookmarks" : "Save this article to your bookmarks"}
          />
          
          <Button
            icon={<Share2 size={isSmallScreen ? '$1' : '$1.5'} />}
            size={isSmallScreen ? '$3' : '$4'}
            circular
            chromeless
            onPress={handleShare}
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            pressStyle={{ scale: 0.95 }}
            accessibilityLabel="Share article"
            accessibilityHint="Share this article with others"
          />
        </XStack>
      </XStack>
      
      {/* Font size controls popup - mobile optimized */}
      {showTextControls && (
        <XStack 
          position="absolute" 
          top={isSmallScreen ? '$10' : '$12'} 
          right="$4" 
          zIndex={100} 
          bg="$background" 
          p="$3" 
          borderRadius="$4"
          borderWidth={1}
          borderColor="$borderColor"
          space="$2"
          ai="center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text size="$1" color="$color">A</Text>
          <Animated.View style={{ width: isSmallScreen ? 80 : 120 }}>
          <Slider
  minimumValue={3}
  maximumValue={8}
  step={0.5}
  value={fontSize}
  onValueChange={setFontSize}
  style={{ width: '100%' }}
  minimumTrackTintColor={theme.blue10.get()}
  maximumTrackTintColor={theme.gray5.get()}
  accessibilityLabel="Adjust text size"
/>
          </Animated.View>
          <Text size="$3" color="$color">A</Text>
        </XStack>
      )}
      
      {/* Sharing preview overlay - mobile responsive */}
      {showSharingPreview && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={200}
          bg="rgba(0,0,0,0.8)"
          ai="center"
          jc="center"
          p={isSmallScreen ? '$3' : '$4'}
        >
          <YStack
            width={imageWidth}
            maxWidth={500}
            bg="$background"
            borderRadius="$4"
            p={isSmallScreen ? '$3' : '$4'}
            space={isSmallScreen ? '$3' : '$4'}
          >
            <Text fontSize={isSmallScreen ? '$5' : '$6'} fontWeight="700" color="$color">Share Article</Text>
            <YStack
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$2"
              p="$3"
              space="$2"
            >
              <Text fontSize={isSmallScreen ? '$4' : '$5'} fontWeight="600" color="$color" numberOfLines={2}>{article.title}</Text>
              <Text fontSize="$3" color="$gray10" numberOfLines={1}>
                {article.source} • {format(new Date(article.pubDate), 'MMM d, yyyy')}
              </Text>
              <Text fontSize={isSmallScreen ? '$3' : '$4'} color="$color" numberOfLines={3}>
                {article.description}
              </Text>
            </YStack>
            
            <XStack space="$3" jc="flex-end">
              <Button
                size="$3"
                variant="outlined"
                onPress={() => setShowSharingPreview(false)}
              >
                Cancel
              </Button>
              <Button
                size="$3"
                theme="blue"
                onPress={confirmShare}
              >
                Share
              </Button>
            </XStack>
          </YStack>
        </YStack>
      )}
      
      {/* Main content - optimized for mobile */}
      <ScrollView
        ref={scrollViewRef}
        flex={1}
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingBottom: 40,
          backgroundColor: showReaderMode ? '$background' : 'transparent'
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <YStack 
          p={isSmallScreen ? '$3' : '$5'} 
          space={isSmallScreen ? '$4' : '$5'} 
          maxWidth={800} 
          margin="auto"
          animation="quick"
        >
          {/* Loading state with skeleton - mobile optimized */}
          {isLoading ? (
            <YStack space="$4">
              <YStack height={imageHeight} bg="$gray3" borderRadius="$4" />
              <YStack height={isSmallScreen ? 30 : 40} width="90%" bg="$gray3" borderRadius="$4" />
              <YStack height={isSmallScreen ? 16 : 20} width="40%" bg="$gray3" borderRadius="$4" />
              <YStack height={200} space="$2">
                {[...Array(5)].map((_, i) => (
                  <YStack key={i} height={15} width={`${90 + Math.random() * 10}%`} bg="$gray3" borderRadius="$4" />
                ))}
              </YStack>
            </YStack>
          ) : (
            <>
              {/* Reading time indicator */}
              {!showReaderMode && (
                <XStack ai="center" space="$2">
                  <Clock size="$1" color="$gray10" />
                  <Text color="$gray10" fontSize="$3">
                    {readingTimeMinutes} min read
                  </Text>
                </XStack>
              )}
              
              {/* Feature image - responsive sizing */}
              {!showReaderMode && article.imageUrl && !imageError ? (
                <Animated.View>
                  <Animated.Image
                    source={{ uri: article.imageUrl }}
                    style={{
                      width: imageWidth,
                      height: imageHeight,
                      borderRadius: 8,
                      resizeMode: 'cover',
                    }}
                    onError={() => setImageError(true)}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                  />
                  {isLoading && (
                    <YStack
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      ai="center"
                      jc="center"
                      bg="$gray3"
                    >
                      <ActivityIndicator color={theme.blue10.get()} />
                    </YStack>
                  )}
                </Animated.View>
              ) : (
                !showReaderMode && article.imageUrl && (
                  <YStack
                    width="100%"
                    height={imageHeight}
                    backgroundColor="$gray3"
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="$4"
                  >
                    <Text color="$gray8" fontSize={isSmallScreen ? '$3' : '$4'} fontWeight="600">
                      Image Unavailable
                    </Text>
                  </YStack>
                )
              )}

              {/* Article title - responsive sizing */}
              <Text fontSize={titleFontSize} fontWeight="900" color="$color" lineHeight={isSmallScreen ? '$7' : '$8'}>
                {article.title}
              </Text>

              {/* Article metadata - mobile optimized */}
              <XStack space={isSmallScreen ? '$2' : '$4'} flexWrap="wrap" alignItems="center">
                <Text 
                  fontSize={metadataFontSize}
                  fontWeight="600" 
                  color={article.source === 'Gleaner' ? '$blue10' : '$red10'}
                  accessibilityLabel={`Source: ${article.source}`}
                >
                  {article.source}
                </Text>
                <Text fontSize={metadataFontSize} color="$gray10">•</Text>
                <Text 
                  fontSize={metadataFontSize}
                  color="$gray10"
                  accessibilityLabel={`Published on ${format(new Date(article.pubDate), 'MMMM d, yyyy')}`}
                >
                  {format(new Date(article.pubDate), isSmallScreen ? 'MMM d, yyyy' : 'MMMM d, yyyy')}
                </Text>
                {article.creator && (
                  <>
                    <Text fontSize={metadataFontSize} color="$gray10">•</Text>
                    <Text 
                      fontSize={metadataFontSize}
                      color="$gray10"
                      accessibilityLabel={`Author: ${article.creator}`}
                    >
                      {article.creator}
                    </Text>
                  </>
                )}
              </XStack>

              {/* Reactions section - mobile optimized */}
              {!showReaderMode && (
                <XStack flexWrap="wrap" marginVertical="$2">
                  {reactions.map((reaction, index) => (
                    <ReactionButton
                      key={reaction.emoji}
                      onPress={() => toggleReaction(index)}
                      selected={reaction.selected}
                      accessibilityLabel={`${reaction.emoji} reaction, ${reaction.count} people`}
                    >
                      <XStack space="$1" ai="center">
                        <Text>{reaction.emoji}</Text>
                        <Text fontSize="$3" color={reaction.selected ? '$color' : '$gray10'}>
                          {reaction.count}
                        </Text>
                      </XStack>
                    </ReactionButton>
                  ))}
                </XStack>
              )}

              {/* Main article content - responsive font size */}
              <Paragraph 
                fontSize={`$${fontSize}`} 
                lineHeight={`$${Math.min(fontSize + 2, 8)}`} 
                color="$gray12" 
                letterSpacing={0.5}
                selectable
                accessibilityLabel="Article content"
              >
                {article.content || article.description || 'No content available.'}
              </Paragraph>
              
              {/* Related articles section - mobile optimized */}
              {!showReaderMode && (
                <YStack space={isSmallScreen ? '$3' : '$4'} mt={isSmallScreen ? '$3' : '$4'}>
                  <Text fontSize={isSmallScreen ? '$5' : '$6'} fontWeight="700" color="$color">Related Articles</Text>
                  {relatedArticles.map(related => (
                    <RelatedArticleCard key={related.id} onPress={() => {}}>
                      <Text fontSize={isSmallScreen ? '$3' : '$4'} fontWeight="600" color="$color" mb="$1">
                        {related.title}
                      </Text>
                      <XStack space="$2" ai="center">
                        <Text fontSize={isSmallScreen ? '$2' : '$3'} color={related.source === 'Gleaner' ? '$blue10' : '$red10'}>
                          {related.source}
                        </Text>
                        <Text fontSize={isSmallScreen ? '$2' : '$3'} color="$gray10">•</Text>
                        <Text fontSize={isSmallScreen ? '$2' : '$3'} color="$gray10">
                          {format(new Date(related.pubDate), 'MMM d, yyyy')}
                        </Text>
                      </XStack>
                    </RelatedArticleCard>
                  ))}
                </YStack>
              )}
              
              {/* Comments section - mobile optimized */}
              {!showReaderMode && (
                <YStack space={isSmallScreen ? '$3' : '$4'} mt={isSmallScreen ? '$3' : '$4'}>
                  <XStack ai="center" space="$2">
                    <MessageCircle size={isSmallScreen ? '$1' : '$1.5'} />
                    <Text fontSize={isSmallScreen ? '$5' : '$6'} fontWeight="700" color="$color">
                      Comments ({comments.length})
                    </Text>
                  </XStack>
                  
                  <YStack 
                    p={isSmallScreen ? '$2' : '$3'}
                    borderWidth={1} 
                    borderColor="$borderColor" 
                    borderRadius="$4"
                    space="$2"
                  >
<TextInput
  placeholder="Add a comment..."
  value={commentText}
  onChangeText={setCommentText}
  multiline={true}
  style={{
    width: '100%',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.borderColor.get(),
    minHeight: 80,
    color: theme.color.get(),
  }}
  accessibilityLabel="Comment text input"
/>
                    <XStack jc="flex-end">
                      <Button 
                        size={isSmallScreen ? '$2' : '$3'}
                        theme="blue" 
                        onPress={addComment}
                        disabled={!commentText.trim()}
                      >
                        Post
                      </Button>
                    </XStack>
                  </YStack>
                  
                  <YStack space={isSmallScreen ? '$2' : '$3'}>
                    {comments.map(comment => (
                      <YStack 
                        key={comment.id} 
                        p={isSmallScreen ? '$2' : '$3'}
                        borderWidth={1} 
                        borderColor="$borderColor" 
                        borderRadius="$4"
                        space="$2"
                        bg={comment.author === 'You' ? '$backgroundHover' : undefined}
                      >
                        <XStack jc="space-between" ai="center">
                          <Text fontSize={isSmallScreen ? '$3' : '$4'} fontWeight="700" color="$color">
                            {comment.author}
                          </Text>
                          <Text fontSize={isSmallScreen ? '$2' : '$3'} color="$gray10">
                            {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                          </Text>
                        </XStack>
                        <Text fontSize={isSmallScreen ? '$3' : '$4'} color="$color">
                          {comment.text}
                        </Text>
                      </YStack>
                    ))}
                  </YStack>
                </YStack>
              )}
            </>
          )}
        </YStack>
      </ScrollView>
      
      {/* Back to top button - mobile optimized */}
      {showBackToTop && (
        <FloatingButton
          icon={<ArrowUp size={isSmallScreen ? '$1' : '$1.5'} />}
          onPress={scrollToTop}
          accessibilityLabel="Back to top"
          accessibilityHint="Scroll back to the top of the article"
        />
      )}
      
      {/* Navigation hints for swipe gestures - mobile optimized */}
      {!showReaderMode && (prevArticle || nextArticle) && !isSmallScreen && (
        <XStack position="absolute" bottom={16} left={0} right={0} jc="center" ai="center" space="$4">
          {prevArticle && (
            <XStack 
              opacity={0.7} 
              ai="center" 
              space="$1" 
              p="$2" 
              borderRadius="$4"
              style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
            >
              <ArrowLeft size="$1" color="$color" />
              <Text color="$color" fontSize="$3">Swipe for previous</Text>
            </XStack>
          )}
          
          {nextArticle && (
            <XStack 
              opacity={0.7} 
              ai="center" 
              space="$1" 
              p="$2" 
              borderRadius="$4"
              style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
            >
              <Text color="$color" fontSize="$3">Swipe for next</Text>
              <ArrowLeft size="$1" color="$color" style={{ transform: [{ rotate: '180deg' }] }} />
            </XStack>
          )}
        </XStack>
      )}
    </YStack>
  );
}