import api from './api';
import type { ApiResponse, Product } from '../types';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  warehouse?: string;
  lowStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productService = {
  async getAll(params?: ProductQueryParams): Promise<ApiResponse<Product[]>> {
    const res = await api.get<ApiResponse<Product[]>>('/products', { params });
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },

  async create(data: Partial<Product>): Promise<ApiResponse<Product>> {
    const res = await api.post<ApiResponse<Product>>('/products', data);
    return res.data;
  },

  async update(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    const res = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete<ApiResponse<null>>(`/products/${id}`);
    return res.data;
  },
};
