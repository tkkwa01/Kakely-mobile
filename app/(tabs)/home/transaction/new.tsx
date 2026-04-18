import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useHouseholdStore } from "../../../../src/store/household.store";
import { useCategories } from "../../../../src/hooks/useCategories";
import { useCreateTransaction } from "../../../../src/hooks/useTransactions";
import { toYYYYMMDD } from "../../../../src/lib/formatters";
import { Colors } from "../../../../src/constants/colors";
import type { TransactionType } from "../../../../src/types/api.types";

const schema = z.object({
  amount: z.string().min(1, "金額を入力してください"),
  categoryId: z.string().min(1, "カテゴリを選択してください"),
  memo: z.string().max(200).optional(),
  date: z.string(),
});
type FormData = z.infer<typeof schema>;

export default function NewTransactionScreen() {
  const router = useRouter();
  const [txType, setTxType] = useState<TransactionType>("expense");
  const { activeHouseholdId } = useHouseholdStore();

  const { data: categories } = useCategories(activeHouseholdId);
  const createMutation = useCreateTransaction(activeHouseholdId ?? "");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: toYYYYMMDD(new Date()) },
  });

  const filteredCategories = categories?.filter((c) => c.type === txType) ?? [];

  const onSubmit = async (data: FormData) => {
    if (!activeHouseholdId) return;
    const amount = parseInt(data.amount.replace(/,/g, ""), 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("エラー", "正しい金額を入力してください");
      return;
    }
    try {
      await createMutation.mutateAsync({
        type: txType,
        amount,
        categoryId: data.categoryId,
        memo: data.memo || null,
        date: data.date,
      });
      router.back();
    } catch {
      Alert.alert("エラー", "取引の保存に失敗しました");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>取引を追加</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 収支トグル */}
        <View style={styles.typeToggle}>
          {(["expense", "income"] as TransactionType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeBtn,
                txType === t && {
                  backgroundColor: t === "expense" ? Colors.expense : Colors.income,
                  borderColor: t === "expense" ? Colors.expense : Colors.income,
                },
              ]}
              onPress={() => setTxType(t)}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  txType === t && { color: "#fff" },
                ]}
              >
                {t === "expense" ? "支出" : "収入"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 金額 */}
        <Text style={styles.label}>金額（円）</Text>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.amount && styles.inputError]}
              placeholder="例: 1500"
              keyboardType="numeric"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}

        {/* カテゴリ */}
        <Text style={styles.label}>カテゴリ</Text>
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {filteredCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.categoryId}
                    style={[
                      styles.categoryChip,
                      value === cat.categoryId && {
                        backgroundColor: cat.color,
                        borderColor: cat.color,
                      },
                    ]}
                    onPress={() => onChange(cat.categoryId)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        value === cat.categoryId && { color: "#fff" },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        />
        {errors.categoryId && (
          <Text style={styles.errorText}>{errors.categoryId.message}</Text>
        )}

        {/* 日付 */}
        <Text style={styles.label}>日付</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        {/* メモ */}
        <Text style={styles.label}>メモ（任意）</Text>
        <Controller
          control={control}
          name="memo"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.memo]}
              placeholder="メモを入力"
              multiline
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <TouchableOpacity
          style={[styles.saveBtn, isSubmitting && { opacity: 0.6 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.saveBtnText}>保存する</Text>
        </TouchableOpacity>
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
  typeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.border,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  typeBtnText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary },
  label: { fontSize: 13, fontWeight: "500", color: Colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  inputError: { borderColor: Colors.danger },
  errorText: { color: Colors.danger, fontSize: 12, marginTop: -12, marginBottom: 12 },
  memo: { height: 80, textAlignVertical: "top" },
  categoryRow: { flexDirection: "row", gap: 8, paddingBottom: 16 },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  categoryChipText: { fontSize: 14, color: Colors.text },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
