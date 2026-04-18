import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useHouseholdStore } from "../../../src/store/household.store";
import { useMonthlyReport, useTrend } from "../../../src/hooks/useMonthlyReport";
import { formatCurrency, formatYearMonth } from "../../../src/lib/formatters";
import { Colors } from "../../../src/constants/colors";

export default function ReportScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { activeHouseholdId } = useHouseholdStore();
  const { data: report, isLoading } = useMonthlyReport(activeHouseholdId, year, month);
  const { data: trend } = useTrend(activeHouseholdId, 6);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const maxTrend = trend
    ? Math.max(...trend.months.map((m) => Math.max(m.totalIncome, m.totalExpense)), 1)
    : 1;

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

      {isLoading && <ActivityIndicator style={{ marginTop: 32 }} />}

      {report && (
        <ScrollView contentContainerStyle={styles.content}>
          {/* 収支サマリー */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { borderColor: Colors.income }]}>
              <Text style={styles.summaryLabel}>収入</Text>
              <Text style={[styles.summaryAmount, { color: Colors.income }]}>
                {formatCurrency(report.totalIncome)}
              </Text>
            </View>
            <View style={[styles.summaryCard, { borderColor: Colors.expense }]}>
              <Text style={styles.summaryLabel}>支出</Text>
              <Text style={[styles.summaryAmount, { color: Colors.expense }]}>
                {formatCurrency(report.totalExpense)}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>支出内訳</Text>
          {report.byCategory
            .filter((c) => c.type === "expense")
            .map((cat) => (
              <View key={cat.categoryId} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.dot, { backgroundColor: cat.color }]} />
                  <Text style={styles.categoryName}>{cat.categoryName}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: cat.color,
                          width: `${Math.min(cat.percentage, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryPct}>{cat.percentage}%</Text>
                  <Text style={styles.categoryAmount}>
                    {formatCurrency(cat.total)}
                  </Text>
                </View>
              </View>
            ))}

          {/* 推移グラフ（シンプルな棒グラフ） */}
          {trend && (
            <>
              <Text style={styles.sectionTitle}>6ヶ月推移</Text>
              <View style={styles.trendChart}>
                {trend.months.map((m, i) => (
                  <View key={i} style={styles.trendCol}>
                    <View style={styles.trendBars}>
                      <View
                        style={[
                          styles.trendBar,
                          {
                            backgroundColor: Colors.income,
                            height: (m.totalIncome / maxTrend) * 80,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.trendBar,
                          {
                            backgroundColor: Colors.expense,
                            height: (m.totalExpense / maxTrend) * 80,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.trendLabel}>{m.month}月</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
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
  content: { padding: 16, paddingBottom: 40 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
  },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  summaryAmount: { fontSize: 16, fontWeight: "700" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
  },
  categoryLeft: { flexDirection: "row", alignItems: "center", width: 100 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  categoryName: { fontSize: 13, color: Colors.text, flex: 1 },
  categoryRight: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  barBg: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
  categoryPct: { fontSize: 12, color: Colors.textSecondary, width: 36, textAlign: "right" },
  categoryAmount: { fontSize: 12, fontWeight: "600", color: Colors.text, width: 72, textAlign: "right" },
  trendChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  trendCol: { alignItems: "center", gap: 4 },
  trendBars: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 80 },
  trendBar: { width: 10, borderRadius: 3, minHeight: 2 },
  trendLabel: { fontSize: 10, color: Colors.textSecondary },
});
