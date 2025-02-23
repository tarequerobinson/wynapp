import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch as RNSwitch, Alert } from 'react-native';
import { Button, H2, Sheet, XStack, YStack } from 'tamagui';
import { X, Mail, MessageSquare, ChevronDown } from '@tamagui/lucide-icons';

type Alert = {
  id: string;
  type: 'price' | 'event';
  symbol: string;
  condition?: 'above' | 'below';
  price?: number;
  event?: 'earnings' | 'dividend' | 'split';
  email: boolean;
  sms: boolean;
  createdAt: Date;
};

type NewAlertSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isDark: boolean;
  onCreate: (alert: Alert) => void;
};

export const NewAlertSheet = ({ isOpen, onOpenChange, isDark, onCreate }: NewAlertSheetProps) => {
  const [alertType, setAlertType] = useState<'price' | 'event'>('price');
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [price, setPrice] = useState('');
  const [event, setEvent] = useState<'earnings' | 'dividend' | 'split'>('earnings');
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);

  const handleCreateAlert = () => {
    if (!symbol || (alertType === 'price' && !price)) return;

    const newAlert: Alert = alertType === 'price'
      ? {
          id: Math.random().toString(36).substr(2, 9),
          type: 'price',
          symbol: symbol.toUpperCase(),
          condition,
          price: Number.parseFloat(price),
          email,
          sms,
          createdAt: new Date(),
        }
      : {
          id: Math.random().toString(36).substr(2, 9),
          type: 'event',
          symbol: symbol.toUpperCase(),
          event,
          email,
          sms,
          createdAt: new Date(),
        };

    onCreate(newAlert);
    onOpenChange(false);
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

  return (
    <Sheet modal open={isOpen} onOpenChange={onOpenChange} snapPoints={[85]} dismissOnSnapToBottom>
      <Sheet.Overlay backgroundColor={isDark ? '$gray10' : '$gray5'} opacity={0.5} />
      <Sheet.Frame padding="$3" backgroundColor={isDark ? '$gray1' : '$background'} borderTopLeftRadius="$4" borderTopRightRadius="$4">
        <Sheet.Handle backgroundColor={isDark ? '$gray4' : '$gray6'} />
        <YStack space="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <H2 fontSize="$6" color={isDark ? '$gray12' : '$gray11'}>New Alert</H2>
            <Button chromeless size="$2" icon={<X size="$1" color={isDark ? '$gray12' : '$gray10'} />} onPress={() => onOpenChange(false)} />
          </XStack>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { borderColor: isDark ? '#333' : '#ddd', color: isDark ? '#fff' : '#000', backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}
              placeholder="Symbol (e.g., NCBFG)"
              placeholderTextColor={isDark ? '#999' : '#666'}
              value={symbol}
              onChangeText={setSymbol}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.dropdown, { borderColor: isDark ? '#333' : '#ddd', backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}
              onPress={() => Alert.alert('Alert Type', '', [
                { text: 'Price', onPress: () => setAlertType('price') },
                { text: 'Event', onPress: () => setAlertType('event') },
              ])}
            >
              <Text style={{ color: isDark ? '#fff' : '#000' }}>{alertType}</Text>
              <ChevronDown size={16} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          {alertType === 'price' ? (
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.dropdown, { borderColor: isDark ? '#333' : '#ddd', backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}
                onPress={() => Alert.alert('Condition', '', [
                  { text: 'Above', onPress: () => setCondition('above') },
                  { text: 'Below', onPress: () => setCondition('below') },
                ])}
              >
                <Text style={{ color: isDark ? '#fff' : '#000' }}>{condition}</Text>
                <ChevronDown size={16} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { borderColor: isDark ? '#333' : '#ddd', color: isDark ? '#fff' : '#000', backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}
                placeholder="Price (J$)"
                placeholderTextColor={isDark ? '#999' : '#666'}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.dropdown, { borderColor: isDark ? '#333' : '#ddd', width: '100%', backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}
              onPress={() => Alert.alert('Event Type', '', [
                { text: 'Earnings', onPress: () => setEvent('earnings') },
                { text: 'Dividend', onPress: () => setEvent('dividend') },
                { text: 'Split', onPress: () => setEvent('split') },
              ])}
            >
              <Text style={{ color: isDark ? '#fff' : '#000' }}>{event}</Text>
              <ChevronDown size={16} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          )}

          <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#ddd' }]} />

          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Notifications</Text>
          <View style={styles.notificationOptions}>
            <View style={styles.notificationRow}>
              <RNSwitch
                value={email}
                onValueChange={setEmail}
                trackColor={{ false: isDark ? '#666' : '#999', true: '#0066cc' }}
                thumbColor={isDark ? '#fff' : '#f4f4f4'}
              />
              <Mail size={20} color={email ? '#0066cc' : (isDark ? '#999' : '#666')} />
              <Text style={[styles.notificationLabel, { color: isDark ? '#fff' : '#000' }]}>Email</Text>
            </View>
            <View style={styles.notificationRow}>
              <RNSwitch
                value={sms}
                onValueChange={setSms}
                trackColor={{ false: isDark ? '#666' : '#999', true: '#0066cc' }}
                thumbColor={isDark ? '#fff' : '#f4f4f4'}
              />
              <MessageSquare size={20} color={sms ? '#0066cc' : (isDark ? '#999' : '#666')} />
              <Text style={[styles.notificationLabel, { color: isDark ? '#fff' : '#000' }]}>SMS</Text>
            </View>
          </View>

          <Button
            theme="blue"
            size="$4"
            onPress={handleCreateAlert}
            disabled={!symbol || (alertType === 'price' && !price)}
            opacity={!symbol || (alertType === 'price' && !price) ? 0.5 : 1}
          >
            Create Alert
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderRadius: 4, padding: 8, marginRight: 8, minWidth: 100 },
  dropdown: { borderWidth: 1, borderRadius: 4, padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minWidth: 100 },
  separator: { height: 1, marginVertical: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  notificationOptions: { marginBottom: 12 },
  notificationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  notificationLabel: { fontSize: 14, marginLeft: 8 },
});