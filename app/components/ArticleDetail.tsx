import { useCallback, useState, useEffect } from 'react';
import { YStack, XStack, Text, Paragraph, ScrollView, Button } from 'tamagui';
import { ArrowLeft, Bookmark, BookmarkCheck, Share2 } from '@tamagui/lucide-icons';
import { Animated, Dimensions } from 'react-native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { NewsItem } from '@/api/newsApi';

interface ArticleDetailProps {
  article: NewsItem;
  bookmarkedArticles: Set<string>;
  toggleBookmark: (articleId: string) => void;
  shareArticle: (article: NewsItem) => void;
  onClose: () => void;
}

export function ArticleDetail({ article, bookmarkedArticles, toggleBookmark, shareArticle, onClose }: ArticleDetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  console.log('ArticleDetail received article:', article);

  const handleBookmark = useCallback(() => {
    console.log('Bookmark button pressed for article:', article.title);
    toggleBookmark(article.title);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch((error) =>
      console.error('Haptics error:', error)
    );
  }, [article.title, toggleBookmark]);

  const handleShare = useCallback(() => {
    console.log('Share button pressed for article:', article.title);
    shareArticle(article);
  }, [article, shareArticle]);

  useEffect(() => {
    console.log('useEffect triggered - Image URL changed:', article.imageUrl);
    setImageError(false);
  }, [article.imageUrl]);

  return (
    <YStack
      flex={1}
      bg="$backgroundStrong"
      animation="quick"
      enterStyle={{ opacity: 0, y: 20 }}
      exitStyle={{ opacity: 0, y: -20 }}
      onLayout={() => console.log('ArticleDetail layout rendered')}
    >
      <XStack p="$4" ai="center" jc="space-between" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Button
          icon={<ArrowLeft size="$1.5" />}
          size="$4"
          circular
          chromeless
          onPress={() => {
            console.log('Back button pressed');
            onClose();
          }}
          hoverStyle={{ backgroundColor: '$backgroundHover' }}
          pressStyle={{ scale: 0.95 }}
          accessibilityLabel="Back to news list"
        />
        <XStack space="$3">
          <Button
            icon={bookmarkedArticles.has(article.title) ? <BookmarkCheck size="$1.5" /> : <Bookmark size="$1.5" />}
            size="$4"
            circular
            chromeless
            onPress={handleBookmark}
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            pressStyle={{ scale: 0.95 }}
            accessibilityLabel={bookmarkedArticles.has(article.title) ? "Remove bookmark" : "Add bookmark"}
          />
          <Button
            icon={<Share2 size="$1.5" />}
            size="$4"
            circular
            chromeless
            onPress={handleShare}
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            pressStyle={{ scale: 0.95 }}
            accessibilityLabel="Share article"
          />
        </XStack>
      </XStack>

      <ScrollView
        flex={1}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        onContentSizeChange={(width, height) => console.log('ScrollView content size:', width, height)}
      >
        <YStack p="$5" space="$5" maxWidth={800} margin="auto">
          {isLoading ? (
            <YStack ai="center" jc="center" height={300}>
              <Text mt="$3" color="$gray10">Loading article...</Text>
            </YStack>
          ) : (
            <>
              {article.imageUrl && !imageError ? (
                <Animated.Image
                  source={{ uri: article.imageUrl }}
                  style={{
                    width: Dimensions.get('window').width - 40, // Matches YStack padding
                    height: 300,
                    borderRadius: 8,
                    resizeMode: 'cover', // Explicitly set for clarity
                  }}
                  onLoad={() => console.log('Image loaded successfully:', article.imageUrl)}
                  onError={(e) => {
                    console.log('Image failed to load:', article.imageUrl, 'Error:', e.nativeEvent.error);
                    setImageError(true);
                  }}
                  onLayout={(e) => {
                    const { width, height } = e.nativeEvent.layout;
                    console.log('Image layout rendered with dimensions:', width, height);
                  }}
                />
              ) : (
                article.imageUrl && (
                  <YStack
                    width="100%"
                    height={300}
                    backgroundColor="$gray3"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text color="$gray8" fontSize="$4" fontWeight="600">
                      Image Unavailable
                    </Text>
                    {console.log('Showing fallback - imageError:', imageError, 'imageUrl:', article.imageUrl)}
                  </YStack>
                )
              )}

              <Text fontSize="$8" fontWeight="900" color="$color" lineHeight="$8">
                {article.title}
              </Text>

              <XStack space="$4" flexWrap="wrap" alignItems="center">
                <Text fontSize="$4" fontWeight="600" color={article.source === 'Gleaner' ? '$blue10' : '$red10'}>
                  {article.source}
                </Text>
                <Text fontSize="$4" color="$gray10">•</Text>
                <Text fontSize="$4" color="$gray10">
                  {format(new Date(article.pubDate), 'MMMM d, yyyy')}
                </Text>
                {article.creator && (
                  <>
                    <Text fontSize="$4" color="$gray10">•</Text>
                    <Text fontSize="$4" color="$gray10">{article.creator}</Text>
                  </>
                )}
              </XStack>

              <Paragraph fontSize="$5" lineHeight="$7" color="$gray12" letterSpacing={0.5}>
                {article.content || article.description || 'No content available.'}
              </Paragraph>
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}