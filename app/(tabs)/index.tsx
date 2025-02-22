import { useState } from 'react';
import { Home, CurrencyDollar, Scale, ChartBar, PieChart } from '@tamagui/lucide-icons';
import { Card, XStack, YStack, AnimatePresence, useTheme, Text, ScrollView, Button } from 'tamagui';
import { Dimensions } from 'react-native';
import { Link } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_PADDING = '$4';

const AssetCard = ({ title, value, change, icon: Icon, color }) => {
  const theme = useTheme();
  return (
    <Card
      p="$4"
      borderRadius="$5"
      bg={theme.name === 'dark' ? '$gray2' : '$gray1'}
      animation="quick"
      pressStyle={{ opacity: 0.9 }}
      width="100%"
    >
      <XStack ai="center" gap="$4">
        {Icon && <Icon size="$3" color={color} />}
        <YStack flex={1}>
          <Text fontSize="$5" color={theme.name === 'dark' ? '$gray11' : '$gray10'} fontWeight="600">
            {title || 'Untitled'}
          </Text>
          <Text 
            fontSize="$7" 
            fontWeight="700" 
            color={theme.name === 'dark' ? '$white' : '$gray12'}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {value || 'N/A'}
          </Text>
          <Text fontSize="$4" color={change?.startsWith('+') ? '$green10' : '$red10'}>
            {change || '0%'}
          </Text>
        </YStack>
      </XStack>
    </Card>
  );
};

const NetWorthCard = ({ netWorth, standing }) => {
  const theme = useTheme();
  return (
    <Card
      p="$5"
      bg={theme.name === 'dark' ? '$gray2' : '$gray1'}
      borderRadius="$6"
      animation="quick"
      pressStyle={{ opacity: 0.9 }}
    >
      <YStack gap="$4" ai="center">
        <Text fontSize="$5" color={theme.name === 'dark' ? '$gray11' : '$gray10'} fontWeight="600">
          Net Worth
        </Text>
        <Text 
          fontSize="$10" 
          fontWeight="800" 
          color={theme.name === 'dark' ? '$white' : '$gray12'}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          ${netWorth?.toLocaleString() || '0'}
        </Text>
        <XStack jc="space-around" width="100%" mt="$2">
          <YStack ai="center" gap="$1">
            <Text fontSize="$4" color="$blue10" fontWeight="600">
              Top {100 - (standing?.jamaicaPercentile || 0)}%
            </Text>
            <Text fontSize="$3" color={theme.name === 'dark' ? '$gray9' : '$gray10'}>
              Jamaica
            </Text>
          </YStack>
          <YStack ai="center" gap="$1">
            <Text fontSize="$4" color="$blue10" fontWeight="600">
              Top {100 - (standing?.worldPercentile || 0)}%
            </Text>
            <Text fontSize="$3" color={theme.name === 'dark' ? '$gray9' : '$gray10'}>
              Global
            </Text>
          </YStack>
        </XStack>
      </YStack>
    </Card>
  );
};

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
      title: 'Summary',
      content: (
        <YStack gap="$5">
          <NetWorthCard netWorth={netWorth} standing={financialStanding} />
          <YStack gap="$4">
            <AssetCard
              title="Total Assets"
              value={`$${clientPortfolio?.totalAssets?.toLocaleString()}`}
              change="+2.4%"
              icon={CurrencyDollar}
              color="$green11"
            />
            <AssetCard
              title="Liabilities"
              value={`-$${Math.abs(clientPortfolio?.liabilities).toLocaleString()}`}
              change="-0.8%"
              icon={Scale}
              color="$red11"
            />
          </YStack>
        </YStack>
      ),
    },
    {
      title: 'Assets',
      content: (
        <YStack gap="$5">
          <AssetCard
            title="Real Estate"
            value="$123"
            change="+2.5%"
            icon={Home}
            color="$blue11"
          />
          <Card
            p="$5"
            bg={theme.name === 'dark' ? '$gray2' : '$gray1'}
            borderRadius="$5"
          >
            <Text fontSize="$5" fontWeight="600" color={theme.name === 'dark' ? '$gray11' : '$gray10'}>
              More Assets
            </Text>
            <Text fontSize="$4" color="$gray9" mt="$2">
              Coming Soon
            </Text>
          </Card>
        </YStack>
      ),
    },
    {
      title: 'Insights',
      content: (
        <YStack gap="$5">
          <Card
            p="$5"
            bg={theme.name === 'dark' ? '$gray2' : '$gray1'}
            borderRadius="$5"
          >
            <Text fontSize="$5" fontWeight="600" color={theme.name === 'dark' ? '$gray11' : '$gray10'}>
              Insights
            </Text>
            <Text fontSize="$4" color="$gray9" mt="$2">
              Coming Soon
            </Text>
          </Card>
        </YStack>
      ),
    },
  ];

  return (
    <YStack f={1} bg={theme.name === 'dark' ? '$gray1' : '$background'}>
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
            {/* Pre-render all pages, only animate visibility */}
            {pages.map((page, index) => (
              <YStack
                key={index}
                animation="lazy"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
                opacity={currentPage === index ? 1 : 0}
                pointerEvents={currentPage === index ? 'auto' : 'none'}
                position={currentPage === index ? 'relative' : 'absolute'}
                width="100%"
                gap="$5"
              >
                {page.content}
              </YStack>
            ))}
          </AnimatePresence>
        </ScrollView>
      </YStack>
    </YStack>
  );
}