import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHouseholdStore } from "../../../src/store/household.store";
import { useCreateCategory, useUpdateCategory } from "../../../src/hooks/useCategories";
import { Colors } from "../../../src/constants/colors";
import type { TransactionType } from "../../../src/types/api.types";

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6",
  "#EC4899", "#6B7280",
];

const PRESET_ICONS = [
  "restaurant", "car", "home", "medical", "school",
  "shirt", "gift", "game-controller", "airplane", "cash",
];

const schema = z.object({
  name: z.string().min(1, "カテゴリ名を入力してください").max(30),
  type: z.enum(["income", "expense"]),
  color: z.string(),
  icon: z.string(),
});
type FormData = z.infer<typeof schema>;

export default function CategoryEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const { activeHouseholdId } = useHouseholdStore();

  const createMutation = useCreateCategory(activeHouseholdId ?? "");
  const updateMutation = useUpdateCategory(activeHouseholdId ?? "");

  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "expense",
      color: PRESET_COLORS[0]!,
      icon: PRESET_ICONS[0]!,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (isNew) {
        await createMutation.mutateAsync({
          ...data,
          sortOrder: 999,
        });
      } else {
        await updateMutation.mutateAsync({ categoryId: id!, updates: data });
      }
      router.back();
    } catch {
      Alert.alert("エラー", "保存に失敗しました");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isNew ? "カテゴリを追加" : "カテゴリを編集"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>カテゴリ名</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="例: 食費"
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <Text style={styles.label}>種別</Text>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <View style={styles.typeRow}>
              {(["expense", "income"] as TransactionType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, value === t && styles.typeBtnActive]}
                  onPress={() => onChange(t)}
                >
                  <Text style={[styles.typeBtnText, value === t && { color: "#fff" }]}>
                    {t === "expense" ? "支出" : "収入"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

        <Text style={styles.label}>カラー</Text>
        <Controller
          control={control}
          name="color"
          render={({ field: { onChange, value } }) => (
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, value === c && styles.colorDotSelected]}
                  onPress={() => onChange(c)}
                />
              ))}
            </View>
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
  label: { fontSize: 13, fontWeight: "500", color: Colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  inputError: { borderColor: Colors.danger },
  typeRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    backgroundColor: Colors.card,
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeBtnText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotSelected: { borderWidth: 3, borderColor: Colors.text },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
