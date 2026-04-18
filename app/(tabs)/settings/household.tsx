import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useHouseholdStore } from "../../../src/store/household.store";
import { useHousehold, useRefreshInviteCode, useRemoveMember, useCreateHousehold } from "../../../src/hooks/useHousehold";
import { Colors } from "../../../src/constants/colors";
import { useAuthStore } from "../../../src/store/auth.store";
import { useState } from "react";

export default function HouseholdScreen() {
  const router = useRouter();
  const { activeHouseholdId } = useHouseholdStore();
  const { user } = useAuthStore();
  const [newName, setNewName] = useState("");

  const { data: household } = useHousehold(activeHouseholdId);
  const refreshCode = useRefreshInviteCode(activeHouseholdId ?? "");
  const removeMember = useRemoveMember(activeHouseholdId ?? "");
  const createHousehold = useCreateHousehold();

  const copyInviteCode = async () => {
    if (!household) return;
    await Clipboard.setStringAsync(household.inviteCode);
    Alert.alert("コピー完了", `招待コード「${household.inviteCode}」をコピーしました`);
  };

  if (!activeHouseholdId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>家計簿グループ</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.setupSection}>
          <Text style={styles.setupText}>まだグループがありません。新しく作成しましょう。</Text>
          <TextInput
            style={styles.input}
            placeholder="グループ名（例: 田中家）"
            value={newName}
            onChangeText={setNewName}
          />
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              if (!newName.trim()) return;
              createHousehold.mutate(newName.trim());
            }}
          >
            <Text style={styles.btnText}>グループを作成</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>家計簿グループ</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.householdName}>{household?.name}</Text>

        {/* 招待コード */}
        <View style={styles.inviteCard}>
          <Text style={styles.inviteLabel}>招待コード</Text>
          <Text style={styles.inviteCode}>{household?.inviteCode}</Text>
          <View style={styles.inviteBtns}>
            <TouchableOpacity style={styles.inviteBtn} onPress={copyInviteCode}>
              <Ionicons name="copy-outline" size={18} color={Colors.primary} />
              <Text style={styles.inviteBtnText}>コピー</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inviteBtn}
              onPress={() => refreshCode.mutate()}
            >
              <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
              <Text style={styles.inviteBtnText}>再生成</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* メンバー */}
        <Text style={styles.sectionTitle}>メンバー</Text>
        {household?.members?.map((m) => (
          <View key={m.userId} style={styles.memberRow}>
            <Ionicons name="person-circle" size={36} color={Colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.memberName}>{m.displayName}</Text>
              <Text style={styles.memberRole}>{m.role === "owner" ? "オーナー" : "メンバー"}</Text>
            </View>
            {household.ownerId === user?.uid && m.userId !== user.uid && (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("メンバー除去", `${m.displayName}を除去しますか？`, [
                    { text: "キャンセル", style: "cancel" },
                    {
                      text: "除去",
                      style: "destructive",
                      onPress: () => removeMember.mutate(m.userId),
                    },
                  ])
                }
              >
                <Ionicons name="remove-circle-outline" size={22} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}
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
  householdName: { fontSize: 22, fontWeight: "700", color: Colors.text, marginBottom: 20 },
  inviteCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  inviteLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  inviteCode: { fontSize: 28, fontWeight: "800", letterSpacing: 4, color: Colors.primary, marginBottom: 12 },
  inviteBtns: { flexDirection: "row", gap: 12 },
  inviteBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  inviteBtnText: { color: Colors.primary, fontSize: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, marginBottom: 12 },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  memberName: { fontSize: 15, color: Colors.text },
  memberRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  setupSection: { padding: 20 },
  setupText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20, lineHeight: 22 },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
