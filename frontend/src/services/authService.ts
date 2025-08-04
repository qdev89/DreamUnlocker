import { api } from '../lib/axios';
import { API_ENDPOINTS } from '../config/api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },
};
