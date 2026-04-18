import { create } from "zustand";
import type { User as FirebaseUser } from "firebase/auth";

type AuthState = {
  user: FirebaseUser | null;
  idToken: string | null;
  isLoading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setIdToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  refreshToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  idToken: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setIdToken: (idToken) => set({ idToken }),
  setLoading: (isLoading) => set({ isLoading }),
  refreshToken: async () => {
    const { user } = get();
    if (!user) return;
    const token = await user.getIdToken(true);
    set({ idToken: token });
  },
}));
