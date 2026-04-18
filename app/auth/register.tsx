import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../src/lib/firebase";
import { registerUser } from "../../src/api/auth.api";
import { Colors } from "../../src/constants/colors";

const schema = z
  .object({
    displayName: z.string().min(1, "表示名を入力してください").max(50),
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z.string().min(6, "パスワードは6文字以上です"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "パスワードが一致しません",
    path: ["confirm"],
  });
type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(credential.user, { displayName: data.displayName });
      await registerUser(data.displayName);
      router.replace("/(tabs)/home");
    } catch {
      Alert.alert("登録失敗", "このメールアドレスは既に使用されています");
    }
  };

  const fields: Array<{
    name: keyof FormData;
    placeholder: string;
    secure?: boolean;
    keyboard?: "email-address" | "default";
  }> = [
    { name: "displayName", placeholder: "表示名" },
    { name: "email", placeholder: "メールアドレス", keyboard: "email-address" },
    { name: "password", placeholder: "パスワード（6文字以上）", secure: true },
    { name: "confirm", placeholder: "パスワード（確認）", secure: true },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>アカウント作成</Text>

      {fields.map(({ name, placeholder, secure, keyboard }) => (
        <View key={name}>
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors[name] && styles.inputError]}
                placeholder={placeholder}
                secureTextEntry={secure}
                keyboardType={keyboard ?? "default"}
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors[name] && (
            <Text style={styles.errorText}>{errors[name]?.message}</Text>
          )}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>登録する</Text>
      </TouchableOpacity>

      <Link href="/auth/login" style={styles.link}>
        ログインはこちら
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  inputError: { borderColor: Colors.danger },
  errorText: { color: Colors.danger, fontSize: 12, marginBottom: 8, marginLeft: 4 },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { color: Colors.primary, textAlign: "center", marginTop: 16, fontSize: 14 },
});
