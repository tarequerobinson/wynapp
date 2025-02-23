import { useState } from 'react';
import {
  Home, CurrencyDollar, Scale, ChartBar, PieChart, Building, DollarSign, PiggyBank, 
  TrendingUp, TrendingDown, Users, Briefcase, Wallet, CreditCard, Coins
} from '@tamagui/lucide-icons';
import { Card, XStack, YStack, AnimatePresence, useTheme, Text, ScrollView, Button, styled } from 'tamagui';
import { Dimensions } from 'react-native';
import { Link } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_PADDING = '$4';

// Styled Asset Card with Color Variants
const AssetCard = styled(Card, {
  name: 'AssetCard',
  p: '$4',
  borderRadius: '$5',
  elevate: true,
  borderWidth: 1,
  variants: {
    type: {
      realEstate: { backgroundColor: '$blue2', borderColor: '$blue7' },
      stocks: { backgroundColor: '$green2', borderColor: '$green7' },
      cash: { backgroundColor: '$purple2', borderColor: '$purple7' },
      liabilities: { backgroundColor: '$red2', borderColor: '$red7' },
      other: { backgroundColor: '$gray2', borderColor: '$gray7' },
    },
    dark: {
      true: {
        realEstate: { backgroundColor: '$blue9', borderColor: '$blue5' },
        stocks: { backgroundColor: '$green9', borderColor: '$green5' },
        cash: { backgroundColor: '$purple9', borderColor: '$purple5' },
        liabilities: { backgroundColor: '$red9', borderColor: '$red5' },
        other: { backgroundColor: '$gray9', borderColor: '$gray5' },
      },
    },
  } as const,
});

// Styled Net Worth Card
const NetWorthCard = styled(Card, {
  name: 'NetWorthCard',
  p: '$5',
  bg: '$yellow2',
  borderRadius: '$6',
  borderWidth: 1,
  borderColor: '$yellow7',
  elevate: true,
  variants: {
    dark: {
      true: { bg: '$yellow9', borderColor: '$yellow5' },
    },
  } as const,
});

const SegmentedControl = ({ options, selectedIndex, onSelect }) => {
  const theme = useTheme();
  return (
    <XStack 
      bg={theme.name === 'dark' ? '$gray3' : '$gray2'} 
      borderRadius="$10" 
      p="$1" 
      jc="center"
      width="100%"
      maxWidth={400}
      alignSelf="center"
    >
      {options.map((option, index) => (
        <Button
          key={index}
          unstyled
          flex={1}
          bg={selectedIndex === index ? '$blue10' : 'transparent'}
          borderRadius="$8"
          p="$3"
          onPress={() => onSelect(index)}
          animation="quick"
          pressStyle={{ opacity: 0.8 }}
          hoverStyle={{ bg: selectedIndex === index ? '$blue11' : '$gray4' }}
        >
          <Text
            fontSize="$4"
            fontWeight={selectedIndex === index ? '600' : '500'}
            color={selectedIndex === index ? '$white' : theme.name === 'dark' ? '$gray10' : '$gray9'}
            textAlign="center"
          >
            {option}
          </Text>
        </Button>
      ))}
    </XStack>
  );
};

export default function DashboardScreen() {
  const theme = useTheme();
  const isDark = theme.name === 'dark';
  const [currentPage, setCurrentPage] = useState(0);
  const [clientPortfolio] = useState({
    realEstateValue: 123,
    stockValue: 0,
    cashValue: 500000,
    totalAssets: 900000,
    liabilities: 75000,
  });

  const netWorth = clientPortfolio.totalAssets - clientPortfolio.liabilities;
  const financialStanding = {
    jamaicaPercentile: 95,
    worldPercentile: 80,
    jamaicaRank: 150000,
    worldRank: 1500000000,
  };

  const pages = [
    {
      title: 'Summary',
      content: (
        <YStack gap="$5">
          <NetWorthCard dark={isDark}>
            <YStack gap="$4" ai="center">
              <XStack space="$2" ai="center">
                <Wallet size="$3" color={isDark ? '$yellow5' : '$yellow9'} />
                <Text fontSize="$5" color={isDark ? '$gray11' : '$gray10'} fontWeight="600">
                  Net Worth
                </Text>
              </XStack>
              <Text 
                fontSize="$10" 
                fontWeight="800" 
                color={isDark ? '$white' : '$gray12'}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                ${netWorth?.toLocaleString() || '0'}
              </Text>
              <XStack jc="space-around" width="100%" mt="$2">
                <YStack ai="center" gap="$1">
                  <Text fontSize="$4" color="$blue10" fontWeight="600">
                    Top {100 - (financialStanding?.jamaicaPercentile || 0)}%
                  </Text>
                  <Text fontSize="$3" color={isDark ? '$gray9' : '$gray10'}>
                    Jamaica
                  </Text>
                </YStack>
                <YStack ai="center" gap="$1">
                  <Text fontSize="$4" color="$blue10" fontWeight="600">
                    Top {100 - (financialStanding?.worldPercentile || 0)}%
                  </Text>
                  <Text fontSize="$3" color={isDark ? '$gray9' : '$gray10'}>
                    Global
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          </NetWorthCard>
          <YStack gap="$4">
            <AssetCard
              type="realEstate"
              dark={isDark}
            >
              <XStack ai="center" gap="$4">
                <Home size="$3" color="$blue11" />
                <YStack flex={1}>
                  <Text fontSize="$5" color={isDark ? '$gray11' : '$gray10'} fontWeight="600">Real Estate</Text>
                  <Text fontSize="$7" fontWeight="700" color={isDark ? '$white' : '$gray12'}>${clientPortfolio.realEstateValue.toLocaleString()}</Text>
                  <Text fontSize="$4" color="$green10">+2.5%</Text>
                </YStack>
              </XStack>
            </AssetCard>
            <AssetCard
              type="cash"
              dark={isDark}
            >
              <XStack ai="center" gap="$4">
                <PiggyBank size="$3" color="$purple11" />
                <YStack flex={1}>
                  <Text fontSize="$5" color={isDark ? '$gray11' : '$gray10'} fontWeight="600">Cash</Text>
                  <Text fontSize="$7" fontWeight="700" color={isDark ? '$white' : '$gray12'}>${clientPortfolio.cashValue.toLocaleString()}</Text>
                  <Text fontSize="$4" color="$green10">+0.5%</Text>
                </YStack>
              </XStack>
            </AssetCard>
            <AssetCard
              type="liabilities"
              dark={isDark}
            >
              <XStack ai="center" gap="$4">
                <CreditCard size="$3" color="$red11" />
                <YStack flex={1}>
                  <Text fontSize="$5" color={isDark ? '$gray11' : '$gray10'} fontWeight="600">Liabilities</Text>
                  <Text fontSize="$7" fontWeight="700" color={isDark ? '$white' : '$gray12'}>-${Math.abs(clientPortfolio.liabilities).toLocaleString()}</Text>
                  <Text fontSize="$4" color="$red10">-0.8%</Text>
                </YStack>
              </XStack>
            </AssetCard>
          </YStack>
        </YStack>
      ),
    },
    {
      title: 'Assets',
      content: (
        <YStack gap="$5">
          <AssetCard
            type="realEstate"
            dark={isDark}
          >
            <XStack ai="center" gap="$4">
              <Building size="$3" color="$blue11" />
              <YStack flex={1}>
                <Text fontSize="$5" color={isDark ? '$gray11' : '$gray10'} fontWeight="600">Real Estate</Text>
                <Text fontSize="$7" fontWeight="700" color={isDark ? '$white' : '$gray12'}>${clientPortfolio.realEstateValue.toLocaleString()}</Text>
                <Text fontSize="$4" color="$green10">+2.5%</Text>
              </YStack>
            </XStack>
          </AssetCard>
          <AssetCard
            type="stocks"
            dark={isDark}
          >
            <XStack ai="center" gap="$4">
              <ChartBar size="$3" color="$green11" />
              <YStack flex={1}>
                <Text fontSize="$5" color={isDark ? '$gray11' : '$gray10'} fontWeight="600">Stocks</Text>
                <Text fontSize="$7" fontWeight="700" color={isDark ? '$white' : '$gray12'}>${clientPortfolio.stockValue.toLocaleString()}</Text>
                <Text fontSize="$4" color="$gray9">0%</Text>
              </YStack>
            </XStack>
          </AssetCard>
          <AssetCard
            type="cash"
            dark={isDark}
          >
            <XStack ai="center" gap="$4">
              <Coins size="$3" color="$purple11" />
              <YStack flex={1}>
                <Text fontSize="$5" color={isDark ? '$gray11' : '$gray10'} fontWeight="600">Cash</Text>
                <Text fontSize="$7" fontWeight="700" color={isDark ? '$white' : '$gray12'}>${clientPortfolio.cashValue.toLocaleString()}</Text>
                <Text fontSize="$4" color="$green10">+0.5%</Text>
              </YStack>
            </XStack>
          </AssetCard>
          <AssetCard
            type="other"
            dark={isDark}
          >
            <XStack ai="center" gap="$4">
              <Briefcase size="$3" color="$gray11" />
              <YStack flex={1}>
                <Text fontSize="$5" color={isDark ? '$gray11' : '$gray10'} fontWeight="600">Other Assets</Text>
                <Text fontSize="$4" color={isDark ? '$gray9' : '$gray10'}>Coming Soon</Text>
              </YStack>
            </XStack>
          </AssetCard>
        </YStack>
      ),
    },
    {
      title: 'Insights',
      content: (
        <YStack gap="$5">
          <Card
            p="$5"
            bg={isDark ? '$orange9' : '$orange2'}
            borderRadius="$5"
            borderWidth={1}
            borderColor={isDark ? '$orange5' : '$orange7'}
            elevate={true}
          >
            <XStack ai="center" gap="$4">
              <TrendingUp size="$3" color="$orange11" />
              <YStack flex={1}>
                <Text fontSize="$5" color={isDark ? '$gray11' : '$gray10'} fontWeight="600">Market Trends</Text>
                <Text fontSize="$4" color={isDark ? '$gray9' : '$gray10'}>Coming Soon</Text>
              </YStack>
            </XStack>
          </Card>
          <Card
            p="$5"
            bg={isDark ? '$purple9' : '$purple2'}
            borderRadius="$5"
            borderWidth={1}
            borderColor={isDark ? '$purple5' : '$purple7'}
            elevate={true}
          >
            <XStack ai="center" gap="$4">
              <Users size="$3" color="$purple11" />
              <YStack flex={1}>
                <Text fontSize="$5" color={isDark ? '$gray11' : '$gray10'} fontWeight="600">Peer Comparison</Text>
                <Text fontSize="$4" color={isDark ? '$gray9' : '$gray10'}>Coming Soon</Text>
              </YStack>
            </XStack>
          </Card>
        </YStack>
      ),
    },
  ];

  return (
    <YStack f={1} bg={isDark ? '$gray1Dark' : '$background'}>
      <YStack gap="$5" p={CONTAINER_PADDING} f={1}>
        <SegmentedControl
          options={pages.map(p => p.title)}
          selectedIndex={currentPage}
          onSelect={setCurrentPage}
        />
        <ScrollView
          f={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ pb: '$6' }}
        >
          <AnimatePresence>
            {pages.map((page, index) => {
              const isEntering = currentPage === index;
              const isForward = currentPage > (currentPage - 1); // Simplified for sequential navigation
              return (
                <YStack
                  key={index}
                  animation="medium"
                  enterStyle={{
                    x: isForward ? SCREEN_WIDTH : -SCREEN_WIDTH,
                    opacity: 0,
                  }}
                  exitStyle={{
                    x: isForward ? -SCREEN_WIDTH : SCREEN_WIDTH,
                    opacity: 0,
                  }}
                  x={isEntering ? 0 : isForward ? -SCREEN_WIDTH : SCREEN_WIDTH}
                  opacity={isEntering ? 1 : 0}
                  pointerEvents={isEntering ? 'auto' : 'none'}
                  position={isEntering ? 'relative' : 'absolute'}
                  width="100%"
                  gap="$5"
                  minHeight={Dimensions.get('window').height - 60}
                >
                  {page.content}
                </YStack>
              );
            })}
          </AnimatePresence>
        </ScrollView>
      </YStack>
    </YStack>
  );
}