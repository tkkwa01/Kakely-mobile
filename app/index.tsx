import { Redirect } from "expo-router";
import { useAuthStore } from "../src/store/auth.store";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return user ? <Redirect href="/(tabs)/home" /> : <Redirect href="/auth/login" />;
}
