import { useState } from 'react';
import {
  View,
  Text,
  XStack,
  YStack,
  Input,
  Button,
  Switch,
  ScrollView,
  Select,
  Sheet,
} from 'tamagui';
import { Plus, X, Bell, ArrowUp, ArrowDown, Mail, MessageSquare, Calendar } from '@tamagui/lucide-icons';

type PriceAlert = {
  id: string;
  type: 'price';
  symbol: string;
  condition: 'above' | 'below';
  price: number;
  email: boolean;
  sms: boolean;
  createdAt: Date;
};

type EventAlert = {
  id: string;
  type: 'event';
  symbol: string;
  event: 'earnings' | 'dividend' | 'split';
  email: boolean;
  sms: boolean;
  createdAt: Date;
};

type Alert = PriceAlert | EventAlert;

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

const MOCK_ALERTS: Alert[] = [
  { id: 'alert1', type: 'price', symbol: 'NCBFG', condition: 'above', price: 155.00, email: true, sms: false, createdAt: new Date('2025-02-15') },
  { id: 'alert2', type: 'event', symbol: 'JMMBGL', event: 'earnings', email: true, sms: true, createdAt: new Date('2025-02-16') },
  { id: 'alert3', type: 'price', symbol: 'PJAM', condition: 'above', price: 82.00, email: false, sms: true, createdAt: new Date('2025-02-17') },
];

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [alertType, setAlertType] = useState<'price' | 'event'>('price');
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [price, setPrice] = useState('');
  const [event, setEvent] = useState<'earnings' | 'dividend' | 'split'>('earnings');
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const SelectCondition = () => (
    <Select
      value={condition}
      onValueChange={(val) => setCondition(val as 'above' | 'below')}
    >
      <Select.Trigger width={90} backgroundColor="$gray2" borderWidth={0}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Viewport minWidth={90} backgroundColor="$gray2">
          <Select.Item index={0} value="above">
            <Select.ItemText>Above</Select.ItemText>
          </Select.Item>
          <Select.Item index={1} value="below">
            <Select.ItemText>Below</Select.ItemText>
          </Select.Item>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );

  const SelectEvent = () => (
    <Select
      value={event}
      onValueChange={(val) => setEvent(val as 'earnings' | 'dividend' | 'split')}
    >
      <Select.Trigger width={120} backgroundColor="$gray2" borderWidth={0}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Viewport minWidth={120} backgroundColor="$gray2">
          <Select.Item index={0} value="earnings">
            <Select.ItemText>Earnings</Select.ItemText>
          </Select.Item>
          <Select.Item index={1} value="dividend">
            <Select.ItemText>Dividend</Select.ItemText>
          </Select.Item>
          <Select.Item index={2} value="split">
            <Select.ItemText>Split</Select.ItemText>
          </Select.Item>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );

  const handleCreateAlert = () => {
    if (!symbol) return;
    let newAlert: Alert;
    if (alertType === 'price' && !price) return;
    if (alertType === 'price') {
      newAlert = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'price',
        symbol: symbol.toUpperCase(),
        condition,
        price: Number.parseFloat(price),
        email,
        sms,
        createdAt: new Date(),
      };
    } else {
      newAlert = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'event',
        symbol: symbol.toUpperCase(),
        event,
        email,
        sms,
        createdAt: new Date(),
      };
    }
    setAlerts([...alerts, newAlert]);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setSymbol('');
    setPrice('');
    setCondition('above');
    setEvent('earnings');
    setAlertType('price');
    setEmail(true);
    setSms(false);
  };

  const handleDeleteAlert = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      setAlerts(alerts.filter((a) => a.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    }
  };

  const toggleNotification = (id: string, type: 'email' | 'sms') => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id
          ? { ...alert, [type]: !alert[type] }
          : alert
      )
    );
  };

  const sortedAlerts = [...alerts].sort((a, b) =>
    sortOrder === 'desc'
      ? b.createdAt.getTime() - a.createdAt.getTime()
      : a.createdAt.getTime() - b.createdAt.getTime()
  );

  return (
    <View flex={1} backgroundColor="$background">
      {/* Header with Ticker */}
      <YStack padding="$3" backgroundColor="$background">
        <XStack alignItems="center" space="$2" marginBottom="$2">
          <Bell size="$2" color="$gray10" />
          <Text fontSize="$8" fontWeight="bold" color="$color">
            Stock Alerts
          </Text>
        </XStack>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack space="$3">
            {MOCK_STOCKS.map((stock) => (
              <XStack key={stock.symbol} space="$2" alignItems="center">
                <Text fontSize="$5" fontWeight="600" color="$color">{stock.symbol}</Text>
                <Text fontSize="$4" color="$gray10">J${stock.price.toFixed(2)}</Text>
                <Text fontSize="$3" color={stock.change >= 0 ? '$green9' : '$red9'}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </Text>
              </XStack>
            ))}
          </XStack>
        </ScrollView>
      </YStack>

      {/* Alerts List */}
      <ScrollView flex={1}>
        <YStack padding="$3" space="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$5" color="$gray10">{alerts.length} Alerts</Text>
            <Button
              size="$2"
              chromeless
              onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              color="$blue10"
            >
              Sort {sortOrder === 'desc' ? '↑' : '↓'}
            </Button>
          </XStack>
          {alerts.length === 0 ? (
            <YStack alignItems="center" padding="$4" backgroundColor="$gray3">
              <Bell size="$2" color="$gray8" />
              <Text fontSize="$5" color="$gray10" marginTop="$2">No Alerts Yet</Text>
              <Text fontSize="$3" color="$gray8" marginTop="$1">
                Tap + to create one
              </Text>
            </YStack>
          ) : (
            sortedAlerts.map((alert) => (
              <YStack
                key={alert.id}
                padding="$3"
                backgroundColor="$background"
                borderRadius="$4"
                space="$2"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack space="$2" alignItems="center">
                    {alert.type === 'price' ? (
                      alert.condition === 'above' ? (
                        <ArrowUp size="$1" color="$green9" />
                      ) : (
                        <ArrowDown size="$1" color="$red9" />
                      )
                    ) : (
                      <Calendar size="$1" color="$blue10" />
                    )}
                    <YStack>
                      <Text fontSize="$6" fontWeight="600" color="$color">{alert.symbol}</Text>
                      <Text fontSize="$4" color="$gray10">
                        {alert.type === 'price'
                          ? `J$${alert.price.toFixed(2)}`
                          : alert.event.charAt(0).toUpperCase() + alert.event.slice(1)}
                      </Text>
                    </YStack>
                  </XStack>
                  <Button
                    size="$2"
                    chromeless
                    icon={<X size="$1" color="$red10" />}
                    onPress={() => handleDeleteAlert(alert.id)}
                  />
                </XStack>
                <XStack space="$3" justifyContent="flex-end">
                  <XStack space="$1" alignItems="center">
                    <Mail size="$1" color={alert.email ? '$blue10' : '$gray8'} />
                    <Switch
                      size="$1"
                      checked={alert.email}
                      onCheckedChange={() => toggleNotification(alert.id, 'email')}
                      backgroundColor={alert.email ? '$blue10' : '$gray8'}
                    >
                      <Switch.Thumb animation="quick" backgroundColor="$white" />
                    </Switch>
                  </XStack>
                  <XStack space="$1" alignItems="center">
                    <MessageSquare size="$1" color={alert.sms ? '$blue10' : '$gray8'} />
                    <Switch
                      size="$1"
                      checked={alert.sms}
                      onCheckedChange={() => toggleNotification(alert.id, 'sms')}
                      backgroundColor={alert.sms ? '$blue10' : '$gray8'}
                    >
                      <Switch.Thumb animation="quick" backgroundColor="$white" />
                    </Switch>
                  </XStack>
                </XStack>
              </YStack>
            ))
          )}
        </YStack>
      </ScrollView>

      {/* Floating Add Button */}
      <Button
        position="absolute"
        bottom="$5"
        right="$5"
        size="$5"
        circular
        backgroundColor="$blue10"
        icon={<Plus size="$2" color="$white" />}
        onPress={() => setShowForm(true)}
      />

      {/* Form Sheet */}
      <Sheet
        open={showForm}
        onOpenChange={setShowForm}
        snapPoints={[55]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay backgroundColor="$gray10" opacity={0.5} />
        <Sheet.Frame padding="$4" backgroundColor="$background">
          <YStack space="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$7" fontWeight="bold" color="$color">New Alert</Text>
              <Button
                chromeless
                size="$2"
                icon={<X size="$1" color="$gray10" />}
                onPress={() => setShowForm(false)}
              />
            </XStack>

            <XStack space="$2">
              <Input
                flex={1}
                placeholder="Symbol"
                value={symbol}
                onChangeText={setSymbol}
                autoCapitalize="characters"
                backgroundColor="$gray2"
                borderWidth={0}
                borderRadius="$2"
                padding="$2"
                color="$color"
              />
              <Select
                value={alertType}
                onValueChange={(val) => setAlertType(val as 'price' | 'event')}
              >
                <Select.Trigger width={90} backgroundColor="$gray2" borderWidth={0}>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Viewport minWidth={90} backgroundColor="$gray2">
                    <Select.Item index={0} value="price">
                      <Select.ItemText>Price</Select.ItemText>
                    </Select.Item>
                    <Select.Item index={1} value="event">
                      <Select.ItemText>Event</Select.ItemText>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select>
            </XStack>

            {alertType === 'price' ? (
              <XStack space="$2">
                <SelectCondition />
                <Input
                  flex={1}
                  placeholder="Price (J$)"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  backgroundColor="$gray2"
                  borderWidth={0}
                  borderRadius="$2"
                  padding="$2"
                  color="$color"
                />
              </XStack>
            ) : (
              <SelectEvent />
            )}

            <XStack justifyContent="space-between">
              <XStack space="$2" alignItems="center">
                <Switch
                  size="$2"
                  checked={email}
                  onCheckedChange={setEmail}
                  backgroundColor={email ? '$blue10' : '$gray8'}
                >
                  <Switch.Thumb animation="quick" backgroundColor="$white" />
                </Switch>
                <Mail size="$1" color={email ? '$blue10' : '$gray8'} />
                <Text fontSize="$4" color="$color">Email</Text>
              </XStack>
              <XStack space="$2" alignItems="center">
                <Switch
                  size="$2"
                  checked={sms}
                  onCheckedChange={setSms}
                  backgroundColor={sms ? '$blue10' : '$gray8'}
                >
                  <Switch.Thumb animation="quick" backgroundColor="$white" />
                </Switch>
                <MessageSquare size="$1" color={sms ? '$blue10' : '$gray8'} />
                <Text fontSize="$4" color="$color">SMS</Text>
              </XStack>
            </XStack>

            <Button
              backgroundColor="$blue10"
              color="$white"
              size="$4"
              borderRadius="$3"
              onPress={handleCreateAlert}
              disabled={!symbol || (alertType === 'price' && !price)}
              opacity={!symbol || (alertType === 'price' && !price) ? 0.6 : 1}
            >
              Set Alert
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>

      {/* Delete Confirmation Sheet */}
      <Sheet
        open={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        snapPoints={[30]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay backgroundColor="$gray10" opacity={0.5} />
        <Sheet.Frame padding="$4" backgroundColor="$background">
          <YStack space="$4">
            <Text fontSize="$6" fontWeight="bold" color="$color">
              Are you sure you want to delete this alert?
            </Text>
            <XStack space="$2">
              <Button
                flex={1}
                backgroundColor="$red10"
                color="$white"
                size="$4"
                borderRadius="$3"
                onPress={confirmDelete}
              >
                Yes, Delete
              </Button>
              <Button
                flex={1}
                backgroundColor="$gray8"
                color="$white"
                size="$4"
                borderRadius="$3"
                onPress={() => setShowDeleteConfirm(null)}
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