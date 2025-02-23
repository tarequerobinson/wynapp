import { useCallback, useRef, useEffect } from 'react';
import { Pressable, Animated } from 'react-native';
import { Button, XStack, YStack, Text, useTheme } from 'tamagui';
import { Bookmark, BookmarkCheck, Share2, User, Clock } from '@tamagui/lucide-icons';
import { format } from 'date-fns';
import { NewsItem } from '@/api/newsApi';

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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleCardPress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const handleBookmark = useCallback((e) => {
    e.stopPropagation();
    toggleBookmark(item.title);
  }, [item.title, toggleBookmark]);

  const handleShare = useCallback((e) => {
    e.stopPropagation();
    shareArticle(item);
  }, [item, shareArticle]);

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
          {/* Left Column: Image or Placeholder */}
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
                style={{
                  width: '100%',
                  height: '100%',
                }}
                resizeMode="cover"
              />
            ) : (
              <Text 
                color="$gray8" 
                fontSize="$4"
                fontWeight="600"
                textAlign="center"
                padding="$2"
              >
                No Image
              </Text>
            )}
          </YStack>

          {/* Right Column: Content */}
          <YStack 
            flex={1} 
            padding="$3" 
            space="$2"
            animation="lazy"
            enterStyle={{ x: 10, opacity: 0 }}
          >
            {/* Source and Date */}
            <XStack justifyContent="space-between" alignItems="center">
              <YStack
                backgroundColor={sourceBackgroundColor}
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$2"
              >
                <Text
                  color={sourceColor}
                  fontSize="$2"
                  fontWeight="600"
                >
                  {item.source}
                </Text>
              </YStack>
              <XStack alignItems="center" space="$1">
                <Clock size="$1" color="$gray9" />
                <Text fontSize="$2" color="$gray9">
                  {format(new Date(item.pubDate), 'MMM d, yyyy')}
                </Text>
              </XStack>
            </XStack>

            {/* Title */}
            <Text
              fontSize="$5"
              fontWeight="700"
              color="$color"
              lineHeight="$4"
              numberOfLines={2}
              flex={1}
            >
              {item.title}
            </Text>

            {/* Description */}
            {item.description && (
              <Text
                fontSize="$3"
                color="$gray10"
                lineHeight="$3"
                numberOfLines={3}
                flex={1}
              >
                {item.description}
              </Text>
            )}

            {/* Footer: Author and Actions */}
            <XStack alignItems="center" justifyContent="space-between" marginTop="$1">
              {item.creator && (
                <XStack alignItems="center" space="$1" flex={1}>
                  <User size="$1" color="$gray9" />
                  <Text fontSize="$2" color="$gray9" numberOfLines={1}>
                    {item.creator}
                  </Text>
                </XStack>
              )}
              <XStack space="$2">
                <Button
                  icon={bookmarkedArticles.has(item.title) ? 
                    <BookmarkCheck size="$1" color="$blue10" /> : 
                    <Bookmark size="$1" color="$gray9" />
                  }
                  size="$2"
                  circular
                  backgroundColor="transparent"
                  borderWidth={1}
                  borderColor="$gray5"
                  onPress={handleBookmark}
                  hoverStyle={{ backgroundColor: '$gray3' }}
                  pressStyle={{ scale: 0.95 }}
                  animateOnly={['transform', 'backgroundColor']}
                  animation="quick"
                  accessibilityLabel={bookmarkedArticles.has(item.title) ? "Remove bookmark" : "Add bookmark"}
                />
                <Button
                  icon={<Share2 size="$1" color="$gray9" />}
                  size="$2"
                  circular
                  backgroundColor="transparent"
                  borderWidth={1}
                  borderColor="$gray5"
                  onPress={handleShare}
                  hoverStyle={{ backgroundColor: '$gray3' }}
                  pressStyle={{ scale: 0.95 }}
                  animateOnly={['transform', 'backgroundColor']}
                  animation="quick"
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