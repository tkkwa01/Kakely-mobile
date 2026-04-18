import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../src/lib/firebase";
import { queryClient } from "../src/lib/queryClient";
import { useAuthStore } from "../src/store/auth.store";
import { useHouseholdStore } from "../src/store/household.store";
import { getMe } from "../src/api/auth.api";

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading, setUser, setIdToken, setLoading } = useAuthStore();
  const { activeHouseholdId, setActiveHouseholdId } = useHouseholdStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setIdToken(token);
        try {
          const me = await getMe();
          if (me.defaultHouseholdId) {
            setActiveHouseholdId(me.defaultHouseholdId);
          }
        } catch {
          // ユーザー未登録の場合は無視（register で作成される）
        }
      } else {
        setUser(null);
        setIdToken(null);
        setActiveHouseholdId(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === "auth";
    if (!user && !inAuth) {
      router.replace("/auth/login");
    } else if (user && inAuth) {
      router.replace("/(tabs)/home");
    }
  }, [user, isLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthGate>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
