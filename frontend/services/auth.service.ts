import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username?: string;
    role: string;
    ageVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  verifyAge: async (): Promise<{ id: string; ageVerified: boolean }> => {
    const response = await api.post('/auth/verify-age');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await api.post('/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    return response.data;
  },
};


