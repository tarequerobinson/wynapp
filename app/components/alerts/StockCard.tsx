import { View, Text, StyleSheet } from 'react-native';

type Stock = { symbol: string; price: number; change: number };

export const StockCard = ({ stock, isDark }: { stock: Stock; isDark: boolean }) => (
  <View style={[styles.stockCard, { backgroundColor: isDark ? '#1a1a1a' : '#fff', borderColor: isDark ? '#333' : '#ddd' }]}>
    <View>
      <Text style={[styles.stockSymbol, { color: isDark ? '#fff' : '#000' }]}>{stock.symbol}</Text>
      <Text style={[styles.stockPrice, { color: isDark ? '#ccc' : '#666' }]}>J${stock.price.toFixed(2)}</Text>
    </View>
    <View style={[styles.changeBadge, { backgroundColor: stock.change >= 0 ? (isDark ? '#003300' : '#e6ffe6') : (isDark ? '#330000' : '#ffe6e6') }]}>
      <Text style={[styles.changeText, { color: stock.change >= 0 ? (isDark ? '#99ff99' : '#006600') : (isDark ? '#ff9999' : '#660000') }]}>
        {stock.change >= 0 ? '+' : ''}{stock.change}%
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
  },
  stockSymbol: { fontSize: 16, fontWeight: '600' },
  stockPrice: { fontSize: 14 },
  changeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  changeText: { fontSize: 12, fontWeight: '600' },
});