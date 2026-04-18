import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../../../src/store/auth.store";
import { updateMe } from "../../../src/api/auth.api";
import { Colors } from "../../../src/constants/colors";

const schema = z.object({
  displayName: z.string().min(1, "表示名を入力してください").max(50),
});
type FormData = z.infer<typeof schema>;

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: user?.displayName ?? "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateMe({ displayName: data.displayName });
      Alert.alert("保存しました");
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
        <Text style={styles.headerTitle}>プロフィール</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>表示名</Text>
        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.displayName && styles.inputError]}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.displayName && (
          <Text style={styles.errorText}>{errors.displayName.message}</Text>
        )}

        <Text style={styles.emailLabel}>{user?.email}</Text>

        <TouchableOpacity
          style={[styles.btn, isSubmitting && { opacity: 0.6 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.btnText}>保存する</Text>
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
  label: { fontSize: 13, fontWeight: "500", color: Colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  inputError: { borderColor: Colors.danger },
  errorText: { color: Colors.danger, fontSize: 12, marginBottom: 8 },
  emailLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 24 },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
