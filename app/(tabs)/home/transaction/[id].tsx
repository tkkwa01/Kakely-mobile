import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getTransaction } from "../../../../src/api/transactions.api";
import { useDeleteTransaction } from "../../../../src/hooks/useTransactions";
import { useHouseholdStore } from "../../../../src/store/household.store";
import { formatCurrency, formatDate } from "../../../../src/lib/formatters";
import { Colors } from "../../../../src/constants/colors";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activeHouseholdId } = useHouseholdStore();

  const { data: tx, isLoading } = useQuery({
    queryKey: ["transaction", activeHouseholdId, id],
    queryFn: () => getTransaction(activeHouseholdId!, id!),
    enabled: !!activeHouseholdId && !!id,
  });

  const deleteMutation = useDeleteTransaction(activeHouseholdId ?? "");

  const handleDelete = () => {
    Alert.alert("削除の確認", "この取引を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await deleteMutation.mutateAsync(id!);
          router.back();
        },
      },
    ]);
  };

  if (isLoading || !tx) {
    return <SafeAreaView style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>取引詳細</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.amountSection}>
          <Text style={styles.typeLabel}>
            {tx.type === "income" ? "収入" : "支出"}
          </Text>
          <Text
            style={[
              styles.amount,
              { color: tx.type === "income" ? Colors.income : Colors.expense },
            ]}
          >
            {tx.type === "income" ? "+" : "-"}
            {formatCurrency(tx.amount)}
          </Text>
        </View>

        <View style={styles.card}>
          {[
            { label: "カテゴリ", value: tx.categoryName },
            { label: "日付", value: formatDate(tx.date) },
            { label: "メモ", value: tx.memo ?? "なし" },
          ].map(({ label, value }) => (
            <View key={label} style={styles.row}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowValue}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: Colors.text },
  content: { padding: 20 },
  amountSection: { alignItems: "center", paddingVertical: 32 },
  typeLabel: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
  amount: { fontSize: 36, fontWeight: "bold" },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLabel: { fontSize: 14, color: Colors.textSecondary },
  rowValue: { fontSize: 14, color: Colors.text, fontWeight: "500" },
});
