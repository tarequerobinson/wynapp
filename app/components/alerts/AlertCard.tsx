import { View, Text, StyleSheet, TouchableOpacity, Switch as RNSwitch } from 'react-native';
import { ArrowUp, ArrowDown, Mail, MessageSquare, X, Calendar } from '@tamagui/lucide-icons';

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

export const AlertCard = ({
  alert,
  onDelete,
  onToggleNotification,
  isDark,
}: {
  alert: Alert;
  onDelete: (id: string) => void;
  onToggleNotification: (id: string, type: 'email' | 'sms') => void;
  isDark: boolean;
}) => (
  <View style={[styles.alertCard, { backgroundColor: isDark ? '#1a1a1a' : '#fff', borderColor: isDark ? '#333' : '#ddd' }]}>
    <View style={styles.alertCardHeader}>
      <View style={styles.alertIconContainer}>
        {alert.type === 'price' ? (
          alert.condition === 'above' ? (
            <ArrowUp size={20} color={isDark ? '#99ff99' : '#006600'} />
          ) : (
            <ArrowDown size={20} color={isDark ? '#ff9999' : '#660000'} />
          )
        ) : (
          <Calendar size={20} color={isDark ? '#9999ff' : '#000066'} />
        )}
      </View>
      <View>
        <Text style={[styles.alertSymbol, { color: isDark ? '#fff' : '#000' }]}>{alert.symbol}</Text>
        <Text style={[styles.alertDetail, { color: isDark ? '#ccc' : '#666' }]}>
          {alert.type === 'price'
            ? `J$${alert.price?.toFixed(2)} ${alert.condition}`
            : alert.event?.charAt(0).toUpperCase() + alert.event?.slice(1)}
        </Text>
      </View>
    </View>
    <View style={styles.alertActions}>
      <View style={styles.notificationToggle}>
        <RNSwitch
          value={alert.email}
          onValueChange={() => onToggleNotification(alert.id, 'email')}
          trackColor={{ false: '#666', true: '#0066cc' }}
          thumbColor={isDark ? '#fff' : '#f4f4f4'}
        />
        <Mail size={16} color={alert.email ? '#0066cc' : (isDark ? '#999' : '#666')} />
      </View>
      <View style={styles.notificationToggle}>
        <RNSwitch
          value={alert.sms}
          onValueChange={() => onToggleNotification(alert.id, 'sms')}
          trackColor={{ false: '#666', true: '#0066cc' }}
          thumbColor={isDark ? '#fff' : '#f4f4f4'}
        />
        <MessageSquare size={16} color={alert.sms ? '#0066cc' : (isDark ? '#999' : '#666')} />
      </View>
      <TouchableOpacity onPress={() => onDelete(alert.id)}>
        <X size={20} color={isDark ? '#ff6666' : '#cc0000'} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  alertCard: { borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1 },
  alertCardHeader: { flexDirection: 'row', alignItems: 'center' },
  alertIconContainer: { marginRight: 12 },
  alertSymbol: { fontSize: 18, fontWeight: '600' },
  alertDetail: { fontSize: 14 },
  alertActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  notificationToggle: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
});