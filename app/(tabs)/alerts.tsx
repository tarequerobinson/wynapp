import { useState, useEffect } from 'react';
import {
  View,
  Text,
  XStack,
  YStack,
  Input,
  Button,
  Label,
  Switch,
  ScrollView,
  Card,
  Adapt,
  Select,
  Sheet,
  AnimatePresence,
  Separator,
  useTheme,
} from 'tamagui';
import { Bell, Plus, X, Trash } from '@tamagui/lucide-icons';

type Alert = {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  price: number;
  email: boolean;
  sms: boolean;
  createdAt: Date;
};

type Stock = {
  symbol: string;
  price: number;
  change: number;
};

const MOCK_STOCKS: Stock[] = [
  { symbol: 'NCBFG', price: 150.25, change: 2.5 },
  { symbol: 'JMMBGL', price: 45.75, change: -0.5 },
  { symbol: 'PJAM', price: 80.0, change: 1.2 },
];

// Mock data for pre-existing alerts
const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert1',
    symbol: 'NCBFG',
    condition: 'above',
    price: 155.00,
    email: true,
    sms: false,
    createdAt: new Date('2025-02-15T10:00:00Z'),
  },
  {
    id: 'alert2',
    symbol: 'JMMBGL',
    condition: 'below',
    price: 45.00,
    email: true,
    sms: true,
    createdAt: new Date('2025-02-16T14:30:00Z'),
  },
  {
    id: 'alert3',
    symbol: 'PJAM',
    condition: 'above',
    price: 82.00,
    email: false,
    sms: true,
    createdAt: new Date('2025-02-17T09:15:00Z'),
  },
];

export default function AlertsScreen() {
  const theme = useTheme();
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [price, setPrice] = useState('');
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [isDark, setIsDark] = useState(theme.name === 'dark');

  useEffect(() => {
    setIsDark(theme.name === 'dark');
  }, [theme]);

  const SelectDemo = () => (
    <Select
      id="condition"
      value={condition}
      onValueChange={(val) => setCondition(val as 'above' | 'below')}
    >
      <Select.Trigger
        width="100%"
        iconAfter={<Text>▼</Text>}
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$background"
        color="$color"
      >
        <Select.Value placeholder="Select condition" />
      </Select.Trigger>
      <Adapt when="sm" platform="touch">
        <Sheet modal dismissOnSnapToBottom snapPoints={[50]}>
          <Sheet.Frame padding="$4" backgroundColor="$background">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay />
        </Sheet>
      </Adapt>
      <Select.Content zIndex={200000}>
        <Select.Viewport minWidth={200} backgroundColor="$background">
          <Select.Group>
            <Select.Label color="$color">Condition</Select.Label>
            <Select.Item value="above" index={0}>
              <Select.ItemText>Price Above</Select.ItemText>
            </Select.Item>
            <Select.Item value="below" index={1}>
              <Select.ItemText>Price Below</Select.ItemText>
            </Select.Item>
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );

  const handleCreateAlert = () => {
    if (!symbol || !price) return;
    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: symbol.toUpperCase(),
      condition,
      price: Number.parseFloat(price),
      email,
      sms,
      createdAt: new Date(),
    };
    setAlerts([...alerts, newAlert]);
    setShowCreateSheet(false);
    resetForm();
  };

  const resetForm = () => {
    setSymbol('');
    setPrice('');
    setCondition('above');
    setEmail(true);
    setSms(false);
  };

  const handleAddButtonPress = () => {
    setShowCreateSheet(true);
  };

  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView flex={1} contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} padding="$2" space="$4">
          {/* Header */}
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$8" fontWeight="bold" color="$color">
              Stock Alerts
            </Text>
            <Text color="$gray10" fontSize="$3">
              {alerts.length} active
            </Text>
          </XStack>

{/* Stock Ticker Row */}
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  maxHeight="$12" // Adjust this value to set a maximum height (e.g., $12 = 192px in Tamagui default spacing)
>
  <XStack space="$3" paddingBottom="$4">
    {MOCK_STOCKS.map((stock) => (
      <Card
        key={stock.symbol}
        size="$3"
        bordered
        borderColor="$borderColor"
        backgroundColor="$gray2"
        width={120}
        height="$8" // Explicitly set a fixed height for the card (e.g., $8 = 128px)
        shadowColor={isDark ? '$gray8' : '$gray6'}
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={isDark ? 0.2 : 0.3}
        shadowRadius={isDark ? 3 : 4}
        elevation={isDark ? 1 : 2}
      >
        <Card.Header padded>
          <Text fontSize="$5" fontWeight="600" color="$color">
            {stock.symbol}
          </Text>
          <Text fontSize="$6" marginTop="$1" color="$color">
            J${stock.price.toFixed(2)}
          </Text>
          <Text
            fontSize="$3"
            color={stock.change >= 0 ? '$green9' : '$red9'}
          >
            {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change)}%
          </Text>
        </Card.Header>
      </Card>
    ))}
  </XStack>
</ScrollView>


          {/* Alerts List */}
          <YStack flex={1} space="$3">
            <XStack alignItems="center" space="$2">
              <Bell size="$2" color="$gray10" />
              <Text fontSize="$6" fontWeight="600" color="$color">
                Active Alerts
              </Text>
            </XStack>

            {alerts.length === 0 ? (
              <YStack
                flex={1}
                alignItems="center"
                justifyContent="center" // Center vertically when no alerts
                padding="$4"
                backgroundColor="$gray3"
                borderRadius="$4"
              >
                <Text color="$gray10">No alerts yet</Text>
                <Text fontSize="$3" color="$gray8" marginTop="$2">
                  Create your first alert below
                </Text>
              </YStack>
            ) : (
              alerts.map((alert) => (
                <Card
                  key={alert.id}
                  elevate
                  bordered
                  padding="$3"
                  backgroundColor="$background"
                  borderColor="$borderColor"
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack flex={1}>
                      <XStack space="$2" alignItems="center">
                        <Text fontSize="$6" fontWeight="600" color="$color">
                          {alert.symbol}
                        </Text>
                        <Text
                          fontSize="$3"
                          color={alert.condition === 'above' ? '$green9' : '$red9'}
                        >
                          {alert.condition === 'above' ? '▲' : '▼'}
                        </Text>
                      </XStack>
                      <Text fontSize="$4" color="$gray10">
                        J${alert.price.toFixed(2)}
                      </Text>
                      <Text fontSize="$2" color="$gray8">
                        {alert.email && 'Email'} {alert.sms && 'SMS'}
                      </Text>
                      <Text fontSize="$2" color="$gray10">
                        Created: {alert.createdAt.toLocaleString()}
                      </Text>
                    </YStack>
                    <Button
                      size="$2"
                      chromeless
                      icon={<Trash size="$1" color="$red10" />}
                      onPress={() => setAlerts(alerts.filter((a) => a.id !== alert.id))}
                    />
                  </XStack>
                </Card>
              ))
            )}
          </YStack>
        </YStack>
      </ScrollView>

      {/* Floating Action Button */}
      <Button
        size="$5"
        position="absolute"
        bottom="$5"
        right="$5"
        icon={<Plus size="$2" />}
        circular
        elevate
        backgroundColor="$blue10"
        color="$white"
        onPress={handleAddButtonPress}
      />

      {/* Create Alert Sheet */}
      <Sheet
        modal
        open={showCreateSheet}
        onOpenChange={setShowCreateSheet}
        snapPoints={[85]}
        dismissOnSnapToBottom
        zIndex={100000}
      >
        <Sheet.Overlay animation="quick" opacity={0.5} />
        <Sheet.Frame padding="$4" backgroundColor="$background">
          <Sheet.Handle backgroundColor="$gray5" />
          <YStack space="$4">
            <Text fontSize="$7" fontWeight="600" color="$color">
              New Price Alert
            </Text>

            <YStack space="$3">
              <Input
                size="$4"
                placeholder="Stock Symbol (e.g., NCBFG)"
                value={symbol}
                onChangeText={setSymbol}
                autoCapitalize="characters"
                borderWidth={1}
                borderColor="$borderColor"
                backgroundColor="$gray2"
                color="$color"
              />

              <XStack space="$3">
                <SelectDemo />
                <Input
                  flex={1}
                  size="$4"
                  placeholder="Price (J$)"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  borderWidth={1}
                  borderColor="$borderColor"
                  backgroundColor="$gray2"
                  color="$color"
                />
              </XStack>

              <YStack space="$2">
                <Text fontSize="$4" fontWeight="600" color="$color">
                  Notify me via
                </Text>
                <XStack space="$4" justifyContent="space-between">
                  <XStack space="$2" alignItems="center">
                    <Switch size="$2" checked={email} onCheckedChange={setEmail}>
                      <Switch.Thumb animation="quick" />
                    </Switch>
                    <Text color="$color">Email</Text>
                  </XStack>
                  <XStack space="$2" alignItems="center">
                    <Switch size="$2" checked={sms} onCheckedChange={setSms}>
                      <Switch.Thumb animation="quick" />
                    </Switch>
                    <Text color="$color">SMS</Text>
                  </XStack>
                </XStack>
              </YStack>
            </YStack>

            <XStack space="$3">
              <Button
                flex={1}
                size="$4"
                onPress={handleCreateAlert}
                backgroundColor="$blue10"
                color="$white"
                disabled={!symbol || !price}
                opacity={!symbol || !price ? 0.6 : 1}
              >
                Create
              </Button>
              <Button
                flex={1}
                size="$4"
                variant="outlined"
                onPress={() => setShowCreateSheet(false)}
                borderColor="$borderColor"
                color="$color"
              >
                Cancel
              </Button>
            </XStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </View>
  );
}