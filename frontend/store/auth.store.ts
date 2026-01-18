import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authService, AuthResponse } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  username?: string;
  role: string;
  ageVerified: boolean;
  avatarUrl?: string;
  creator?: {
    id: string;
    subscriptionFee: number;
    verified: boolean;
    coverImageUrl?: string;
    bio?: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => void;
  verifyAge: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const data: AuthResponse = await authService.login({ email, password });
      Cookies.set('accessToken', data.accessToken);
      Cookies.set('refreshToken', data.refreshToken);
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  register: async (email: string, password: string, username?: string) => {
    try {
      const data: AuthResponse = await authService.register({ email, password, username });
      Cookies.set('accessToken', data.accessToken);
      Cookies.set('refreshToken', data.refreshToken);
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  verifyAge: async () => {
    try {
      await authService.verifyAge();
      set((state) => ({
        user: state.user ? { ...state.user, ageVerified: true } : null,
      }));
    } catch (error) {
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      // Check if we have tokens in cookies
      const accessToken = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');

      if (!accessToken && !refreshToken) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const user = await authService.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Clear invalid tokens
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));


