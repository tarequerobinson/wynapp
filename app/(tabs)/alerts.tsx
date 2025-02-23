import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, Appearance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Plus, ChevronDown, BellOff } from '@tamagui/lucide-icons';
import { StockCard } from '../components/alerts/StockCard';
import { AlertCard } from '../components/alerts/AlertCard';
import { NewAlertSheet } from '../components/alerts/NewAlertSheet';
import { DeleteAlertDialog } from '../components/alerts/DeleteAlertDialog';

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

type Stock = { symbol: string; price: number; change: number };

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
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, []);

  const handleCreateAlert = (newAlert: Alert) => {
    setAlerts([...alerts, newAlert]);
  };

  const handleDeleteAlert = (id: string) => setShowDeleteConfirm(id);

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      setAlerts(alerts.filter((a) => a.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    }
  };

  const toggleNotification = (id: string, type: 'email' | 'sms') =>
    setAlerts(alerts.map((alert) =>
      alert.id === id ? { ...alert, [type]: !alert[type] } : alert
    ));

  const sortedAlerts = [...alerts].sort((a, b) =>
    sortOrder === 'desc'
      ? b.createdAt.getTime() - a.createdAt.getTime()
      : a.createdAt.getTime() - b.createdAt.getTime()
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stocksScroll}>
          {MOCK_STOCKS.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} isDark={isDark} />
          ))}
        </ScrollView>

        <View style={styles.alertsSection}>
          <View style={styles.alertsHeader}>
            <Text style={[styles.alertsTitle, { color: isDark ? '#fff' : '#000' }]}>Your Alerts ({alerts.length})</Text>
            <TouchableOpacity onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
              <View style={styles.sortButton}>
                <Text style={[styles.sortText, { color: isDark ? '#fff' : '#000' }]}>Sort</Text>
                <ChevronDown size={16} color={isDark ? '#fff' : '#000'} style={sortOrder === 'asc' ? { transform: [{ rotate: '180deg' }] } : {}} />
              </View>
            </TouchableOpacity>
          </View>

          {alerts.length === 0 ? (
            <View style={[styles.noAlerts, { backgroundColor: isDark ? '#1a1a1a' : '#fff', borderColor: isDark ? '#333' : '#ddd' }]}>
              <BellOff size={40} color={isDark ? '#999' : '#666'} />
              <Text style={[styles.noAlertsTitle, { color: isDark ? '#fff' : '#000' }]}>No Alerts Yet</Text>
              <Text style={[styles.noAlertsText, { color: isDark ? '#ccc' : '#666' }]}>Tap + to create your first alert</Text>
            </View>
          ) : (
            <FlatList
              data={sortedAlerts}
              renderItem={({ item }) => (
                <AlertCard
                  alert={item}
                  onDelete={handleDeleteAlert}
                  onToggleNotification={toggleNotification}
                  isDark={isDark}
                />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 16 }]} onPress={() => setShowForm(true)}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <NewAlertSheet isOpen={showForm} onOpenChange={setShowForm} isDark={isDark} onCreate={handleCreateAlert} />
      <DeleteAlertDialog isOpen={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)} onConfirm={confirmDelete} isDark={isDark} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginLeft: 8 },
  stocksScroll: { paddingHorizontal: 12 },
  alertsSection: { padding: 12 },
  alertsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertsTitle: { fontSize: 20, fontWeight: '600' },
  sortButton: { flexDirection: 'row', alignItems: 'center' },
  sortText: { fontSize: 14 },
  noAlerts: { borderRadius: 8, padding: 20, alignItems: 'center', borderWidth: 1 },
  noAlertsTitle: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  noAlertsText: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});