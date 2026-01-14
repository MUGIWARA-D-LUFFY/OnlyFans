import { create } from 'zustand';
import api from '../services/api';

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  ageVerified: boolean;
  creator?: {
    id: string;
    subscriptionFee: number;
    verified: boolean;
    coverImageUrl?: string;
    bio?: string;
  };
}


interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { username?: string; bio?: string; avatarUrl?: string }) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/users/me');
      set({ profile: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (data: { username?: string; bio?: string; avatarUrl?: string }) => {
    try {
      const response = await api.put('/users/me', data);
      set({ profile: response.data });
    } catch (error) {
      throw error;
    }
  },
}));


