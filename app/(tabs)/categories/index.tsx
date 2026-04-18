import { View, Text, StyleSheet, TouchableOpacity, SectionList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHouseholdStore } from "../../../src/store/household.store";
import { useCategories, useDeleteCategory } from "../../../src/hooks/useCategories";
import { Colors } from "../../../src/constants/colors";
import type { Category } from "../../../src/types/api.types";

export default function CategoriesScreen() {
  const router = useRouter();
  const { activeHouseholdId } = useHouseholdStore();
  const { data: categories } = useCategories(activeHouseholdId);
  const deleteMutation = useDeleteCategory(activeHouseholdId ?? "");

  const income = categories?.filter((c) => c.type === "income") ?? [];
  const expense = categories?.filter((c) => c.type === "expense") ?? [];

  const sections = [
    { title: "収入カテゴリ", data: income },
    { title: "支出カテゴリ", data: expense },
  ];

  const handleDelete = (cat: Category) => {
    Alert.alert(`「${cat.name}」を削除`, "このカテゴリを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => deleteMutation.mutate(cat.categoryId),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>カテゴリ</Text>
        <Link href="/(tabs)/categories/new" asChild>
          <TouchableOpacity>
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </Link>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.categoryId}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text style={styles.itemName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push(`/(tabs)/categories/${item.categoryId}`)}
            >
              <Ionicons name="pencil-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            {!item.isDefault && (
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
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
  },
  title: { fontSize: 22, fontWeight: "700", color: Colors.text },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    paddingVertical: 8,
    marginTop: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  itemName: { flex: 1, fontSize: 15, color: Colors.text },
  editBtn: { marginRight: 12 },
});
