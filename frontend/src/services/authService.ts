import api from './api';
import type { ApiResponse, User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    return res.data;
  },

  async register(data: { name: string; email: string; password: string; role: string }): Promise<ApiResponse<User>> {
    const res = await api.post<ApiResponse<User>>('/auth/register', data);
    return res.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};
