import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../../../src/lib/firebase";
import { useAuthStore } from "../../../src/store/auth.store";
import { Colors } from "../../../src/constants/colors";

type SettingRow = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  href?: string;
  onPress?: () => void;
  danger?: boolean;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const rows: SettingRow[] = [
    { label: "プロフィール", icon: "person-outline", href: "/(tabs)/settings/profile" },
    { label: "家計簿グループ", icon: "people-outline", href: "/(tabs)/settings/household" },
    { label: "グループに参加", icon: "enter-outline", href: "/(tabs)/settings/join-household" },
    { label: "ログアウト", icon: "log-out-outline", onPress: handleLogout, danger: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>設定</Text>

      {user && (
        <View style={styles.userCard}>
          <Ionicons name="person-circle" size={48} color={Colors.primary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.userName}>{user.displayName ?? "ユーザー"}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        {rows.map((row) =>
          row.href ? (
            <Link key={row.label} href={row.href as Parameters<typeof Link>[0]["href"]} asChild>
              <TouchableOpacity style={styles.row}>
                <Ionicons
                  name={row.icon}
                  size={22}
                  color={row.danger ? Colors.danger : Colors.text}
                  style={styles.rowIcon}
                />
                <Text style={[styles.rowLabel, row.danger && { color: Colors.danger }]}>
                  {row.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </Link>
          ) : (
            <TouchableOpacity key={row.label} style={styles.row} onPress={row.onPress}>
              <Ionicons
                name={row.icon}
                size={22}
                color={row.danger ? Colors.danger : Colors.text}
                style={styles.rowIcon}
              />
              <Text style={[styles.rowLabel, row.danger && { color: Colors.danger }]}>
                {row.label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: Colors.text, marginBottom: 20 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  userName: { fontSize: 16, fontWeight: "600", color: Colors.text },
  userEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowIcon: { marginRight: 14 },
  rowLabel: { flex: 1, fontSize: 15, color: Colors.text },
});
