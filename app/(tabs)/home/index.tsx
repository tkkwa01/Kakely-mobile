import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useHouseholdStore } from "../../../src/store/household.store";
import { useTransactions } from "../../../src/hooks/useTransactions";
import { useMonthlyReport } from "../../../src/hooks/useMonthlyReport";
import { formatCurrency, formatDate, formatYearMonth } from "../../../src/lib/formatters";
import { Colors } from "../../../src/constants/colors";
import type { Transaction } from "../../../src/types/api.types";

export default function HomeScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { activeHouseholdId } = useHouseholdStore();
  const { data: txData, isLoading: txLoading } = useTransactions(
    activeHouseholdId,
    year,
    month
  );
  const { data: report } = useMonthlyReport(activeHouseholdId, year, month);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Link href={`/(tabs)/home/transaction/${item.transactionId}`} asChild>
      <TouchableOpacity style={styles.txItem}>
        <View style={styles.txLeft}>
          <Text style={styles.txCategory}>{item.categoryName}</Text>
          {item.memo && <Text style={styles.txMemo}>{item.memo}</Text>}
          <Text style={styles.txDate}>{formatDate(item.date)}</Text>
        </View>
        <Text
          style={[
            styles.txAmount,
            { color: item.type === "income" ? Colors.income : Colors.expense },
          ]}
        >
          {item.type === "income" ? "+" : "-"}
          {formatCurrency(item.amount)}
        </Text>
      </TouchableOpacity>
    </Link>
  );

  if (!activeHouseholdId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>家計簿グループに参加してください</Text>
          <Link href="/(tabs)/settings" style={styles.setupLink}>
            設定へ
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 月選択 */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={prevMonth}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{formatYearMonth(year, month)}</Text>
        <TouchableOpacity onPress={nextMonth}>
          <Ionicons name="chevron-forward" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* サマリーカード */}
      {report && (
        <View style={styles.summary}>
          <View style={[styles.summaryCard, { borderLeftColor: Colors.income }]}>
            <Text style={styles.summaryLabel}>収入</Text>
            <Text style={[styles.summaryAmount, { color: Colors.income }]}>
              {formatCurrency(report.totalIncome)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: Colors.expense }]}>
            <Text style={styles.summaryLabel}>支出</Text>
            <Text style={[styles.summaryAmount, { color: Colors.expense }]}>
              {formatCurrency(report.totalExpense)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: Colors.primary }]}>
            <Text style={styles.summaryLabel}>残高</Text>
            <Text
              style={[
                styles.summaryAmount,
                { color: report.balance >= 0 ? Colors.income : Colors.expense },
              ]}
            >
              {formatCurrency(report.balance)}
            </Text>
          </View>
        </View>
      )}

      {/* 取引一覧 */}
      {txLoading ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={txData?.transactions ?? []}
          keyExtractor={(item) => item.transactionId}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>この月の取引はありません</Text>
          }
        />
      )}

      {/* FAB */}
      <Link href="/(tabs)/home/transaction/new" asChild>
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  monthText: { fontSize: 18, fontWeight: "600", color: Colors.text },
  summary: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
  },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  summaryAmount: { fontSize: 14, fontWeight: "700" },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  txItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txLeft: { flex: 1 },
  txCategory: { fontSize: 15, fontWeight: "500", color: Colors.text },
  txMemo: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  txDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  txAmount: { fontSize: 16, fontWeight: "700" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: "center", padding: 24 },
  setupLink: { color: Colors.primary, marginTop: 12, fontSize: 15 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
