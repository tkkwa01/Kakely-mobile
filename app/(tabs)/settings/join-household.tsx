import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useHouseholdStore } from "../../../src/store/household.store";
import { Colors } from "../../../src/constants/colors";
import { apiClient } from "../../../src/api/client";
import { useQueryClient } from "@tanstack/react-query";

export default function JoinHouseholdScreen() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [householdId, setHouseholdId] = useState("");
  const [loading, setLoading] = useState(false);
  const { setActiveHouseholdId } = useHouseholdStore();
  const qc = useQueryClient();

  const handleJoin = async () => {
    if (!inviteCode.trim() || !householdId.trim()) {
      Alert.alert("エラー", "グループIDと招待コードを入力してください");
      return;
    }
    try {
      setLoading(true);
      await apiClient.post(`api/households/${householdId.trim()}/join`, {
        json: { inviteCode: inviteCode.trim().toUpperCase() },
      });
      setActiveHouseholdId(householdId.trim());
      qc.invalidateQueries({ queryKey: ["households"] });
      Alert.alert("参加完了", "グループに参加しました");
      router.back();
    } catch {
      Alert.alert("エラー", "招待コードが正しくないか、グループが見つかりません");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>グループに参加</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          グループのIDと招待コードを入力してください。
        </Text>

        <Text style={styles.label}>グループID</Text>
        <TextInput
          style={styles.input}
          placeholder="グループID"
          autoCapitalize="none"
          value={householdId}
          onChangeText={setHouseholdId}
        />

        <Text style={styles.label}>招待コード</Text>
        <TextInput
          style={styles.input}
          placeholder="例: AB3X9K2M"
          autoCapitalize="characters"
          value={inviteCode}
          onChangeText={(t) => setInviteCode(t.toUpperCase())}
        />

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleJoin}
          disabled={loading}
        >
          <Text style={styles.btnText}>参加する</Text>
        </TouchableOpacity>
      </View>
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
  description: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: "500", color: Colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
