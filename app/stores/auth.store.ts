import { create } from "zustand";

export type User = {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
  provinceId?: number | null;
  districtId?: number | null;
  provinceName?: string | null;
  districtName?: string | null;
  receiveEmailNotifications?: boolean;
};

type AuthState = {
  user: User | null;
  accessToken: string;
  loadingAuth: boolean;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setLoadingAuth: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: "",
  loadingAuth: true,
  isAuthenticated: false,

  setAuth: (user, token) =>
    set((state) => ({
      user: {
        ...state.user,
        ...user,
      },
      accessToken: token,
      isAuthenticated: true,
      loadingAuth: false,
    })),

  setAccessToken: (accessToken) =>
    set({
      accessToken,
      isAuthenticated: accessToken.length > 0,
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: "",
      isAuthenticated: false,
      loadingAuth: false,
    }),

  setLoadingAuth: (loading) => set({ loadingAuth: loading }),
}));
