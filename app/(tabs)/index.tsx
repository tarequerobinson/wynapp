import { useState } from 'react';
import { Home, CurrencyDollar, Scale, ChartBar, Trophy, Globe } from '@tamagui/lucide-icons';
import { Card, Paragraph, XStack, YStack, AnimatePresence, useTheme, Text, ScrollView, Button } from 'tamagui';
import { Dimensions } from 'react-native';
import { Link } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SPACING = '$2';
const CONTAINER_PADDING = '$3';

const AssetCard = ({ title, value, change, icon: Icon, color }) => {
  const theme = useTheme();
  return (
    <Card
      p="$3"
      borderRadius="$4"
      bg={theme.name === 'dark' ? '$gray2' : '$white'}
      borderWidth={1}
      borderColor={theme.name === 'dark' ? '$gray4' : '$gray3'}
      shadowColor={theme.name === 'dark' ? '$gray6' : '$gray4'}
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.1}
      shadowRadius={2}
      animation="quick"
      pressStyle={{ scale: 0.98 }}
      hoverStyle={{ bg: theme.name === 'dark' ? '$gray3' : '$gray1' }}
      width="100%"
    >
      <XStack ai="center" gap="$3">
        {Icon && <Icon size="$1" color={color} />}
        <YStack flex={1} gap="$1">
          <Text fontSize="$3" color={theme.name === 'dark' ? '$gray10' : '$gray11'} fontWeight="600">
            {title || 'Untitled'}
          </Text>
          <Text fontSize="$5" fontWeight="700" color={theme.name === 'dark' ? '$white' : '$gray12'} numberOfLines={1}>
            {value || 'N/A'}
          </Text>
          <Text fontSize="$2" color={change?.startsWith('+') ? '$green9' : '$red9'}>
            {change || '0%'}
          </Text>
        </YStack>
      </XStack>
    </Card>
  );
};

const NetWorthCard = ({ netWorth, standing }) => (
  <Card
    p="$4"
    bg={useTheme().name === 'dark' ? '$gray2' : '$white'}
    borderRadius="$5"
    borderWidth={1}
    borderColor={useTheme().name === 'dark' ? '$gray4' : '$gray3'}
    shadowColor={useTheme().name === 'dark' ? '$gray6' : '$gray4'}
    shadowOffset={{ width: 0, height: 1 }}
    shadowOpacity={0.1}
    shadowRadius={2}
    animation="quick"
    pressStyle={{ scale: 0.98 }}
  >
    <YStack gap="$3">
      <YStack>
        <Text fontSize="$3" color={useTheme().name === 'dark' ? '$gray10' : '$gray11'} fontWeight="600">
          Net Worth
        </Text>
        <Text fontSize="$8" fontWeight="800" color={useTheme().name === 'dark' ? '$white' : '$gray12'}>
          ${netWorth?.toLocaleString()}
        </Text>
      </YStack>
      <XStack gap="$3" flexWrap="wrap">
        <YStack flex={1} minWidth={120}>
          <Text fontSize="$2" color={useTheme().name === 'dark' ? '$gray9' : '$gray10'}>
            Jamaica
          </Text>
          <Text fontSize="$4" fontWeight="600" color={useTheme().name === 'dark' ? '$white' : '$gray12'}>
            #{standing?.jamaicaRank?.toLocaleString()}
          </Text>
          <Text fontSize="$2" color="$blue9">
            Top {100 - standing?.jamaicaPercentile}%
          </Text>
        </YStack>
        <YStack flex={1} minWidth={120}>
          <Text fontSize="$2" color={useTheme().name === 'dark' ? '$gray9' : '$gray10'}>
            Global
          </Text>
          <Text fontSize="$4" fontWeight="600" color={useTheme().name === 'dark' ? '$white' : '$gray12'}>
            #{standing?.worldRank?.toLocaleString()}
          </Text>
          <Text fontSize="$2" color="$blue9">
            Top {100 - standing?.worldPercentile}%
          </Text>
        </YStack>
      </XStack>
    </YStack>
  </Card>
);

const NavigationTabs = ({ tabs, currentIndex, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: CONTAINER_PADDING }}
  >
    <XStack gap="$2" py="$2">
      {tabs.map((tab, index) => (
        <Button
          key={index}
          onPress={() => onSelect(index)}
          bg={currentIndex === index ? '$blue9' : useTheme().name === 'dark' ? '$gray3' : '$gray2'}
          color={currentIndex === index ? '$white' : useTheme().name === 'dark' ? '$gray10' : '$gray11'}
          size="$3"
          borderRadius="$6"
          px="$4"
          animation="quick"
          hoverStyle={{ bg: currentIndex === index ? '$blue10' : useTheme().name === 'dark' ? '$gray4' : '$gray3' }}
          pressStyle={{ scale: 0.95 }}
          borderWidth={1}
          borderColor={useTheme().name === 'dark' ? '$gray5' : '$gray3'}
        >
          <Text fontSize="$4" fontWeight={currentIndex === index ? '600' : '500'}>
            {tab}
          </Text>
        </Button>
      ))}
    </XStack>
  </ScrollView>
);

export default function DashboardScreen() {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [clientPortfolio] = useState({
    realEstateValue: 123,
    stockValue: 0,
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
      title: 'Overview',
      content: (
        <YStack gap="$4">
          <NetWorthCard netWorth={netWorth} standing={financialStanding} />
          <YStack gap="$3">
            <XStack gap={CARD_SPACING} flexWrap="wrap">
              <YStack flex={1} minWidth={SCREEN_WIDTH > 600 ? '48%' : '100%'}>
                <AssetCard
                  title="Total Assets"
                  value={`$${clientPortfolio?.totalAssets?.toLocaleString()}`}
                  change="+2.4%"
                  icon={CurrencyDollar}
                  color="$green10"
                />
              </YStack>
              <YStack flex={1} minWidth={SCREEN_WIDTH > 600 ? '48%' : '100%'}>
                <AssetCard
                  title="Liabilities"
                  value={`-$${Math.abs(clientPortfolio?.liabilities).toLocaleString()}`}
                  change="-0.8%"
                  icon={Scale}
                  color="$red10"
                />
              </YStack>
            </XStack>
          </YStack>
        </YStack>
      ),
    },
    {
      title: 'Distribution',
      content: (
        <YStack gap="$4">
          <Card
            p="$4"
            bg={theme.name === 'dark' ? '$gray2' : '$white'}
            borderRadius="$4"
            borderWidth={1}
            borderColor={theme.name === 'dark' ? '$gray4' : '$gray3'}
            shadowColor={theme.name === 'dark' ? '$gray6' : '$gray4'}
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.1}
            shadowRadius={2}
          >
            <Text fontSize="$4" color={theme.name === 'dark' ? '$white' : '$gray12'}>
              Asset Distribution Chart (Coming Soon)
            </Text>
          </Card>
        </YStack>
      ),
    },
    {
      title: 'Details',
      content: (
        <YStack gap="$4">
          <AssetCard
            title="Real Estate"
            value="$123"
            change="+2.5%"
            icon={Home}
            color="$blue10"
          />
        </YStack>
      ),
    },
    {
      title: 'Analysis',
      content: (
        <YStack gap="$4">
          <Card
            p="$4"
            bg={theme.name === 'dark' ? '$gray2' : '$white'}
            borderRadius="$4"
            borderWidth={1}
            borderColor={theme.name === 'dark' ? '$gray4' : '$gray3'}
            shadowColor={theme.name === 'dark' ? '$gray6' : '$gray4'}
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.1}
            shadowRadius={2}
          >
            <Text fontSize="$4" color={theme.name === 'dark' ? '$white' : '$gray12'}>
              Advanced Analysis (Coming Soon)
            </Text>
          </Card>
        </YStack>
      ),
    },
  ];

  return (
    <YStack f={1} bg={theme.name === 'dark' ? '$gray1' : '$gray1Light'}>
      <Card
        bg={theme.name === 'dark' ? '$gray2' : '$white'}
        borderBottomWidth={1}
        borderColor={theme.name === 'dark' ? '$gray4' : '$gray3'}
        shadowColor={theme.name === 'dark' ? '$gray6' : '$gray4'}
        shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.1}
        shadowRadius={2}
        zIndex={10}
      >
        <NavigationTabs
          tabs={pages.map((p) => p.title)}
          currentIndex={currentPage}
          onSelect={setCurrentPage}
        />
      </Card>

      <ScrollView
        f={1}
        contentContainerStyle={{ p: CONTAINER_PADDING }}
        showsVerticalScrollIndicator={false}
      >
        <AnimatePresence mode="wait">
          <YStack
            key={currentPage}
            animation="bouncy"
            enterStyle={{ x: SCREEN_WIDTH / 4, opacity: 0 }}
            exitStyle={{ x: -SCREEN_WIDTH / 4, opacity: 0 }}
            x={0}
            opacity={1}
            gap="$4"
          >
            {pages[currentPage]?.content}
          </YStack>
        </AnimatePresence>
      </ScrollView>
    </YStack>
  );
}