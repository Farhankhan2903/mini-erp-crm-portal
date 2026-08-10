import api from './api';
import type { ApiResponse, Customer } from '../types';

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const customerService = {
  async getAll(params?: CustomerQueryParams): Promise<ApiResponse<Customer[]>> {
    const res = await api.get<ApiResponse<Customer[]>>('/customers', { params });
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<Customer>> {
    const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data;
  },

  async create(data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    const res = await api.post<ApiResponse<Customer>>('/customers', data);
    return res.data;
  },

  async update(id: string, data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete<ApiResponse<null>>(`/customers/${id}`);
    return res.data;
  },

  async addNote(id: string, note: string, followUpDate?: string): Promise<ApiResponse<Customer>> {
    const res = await api.post<ApiResponse<Customer>>(`/customers/${id}/notes`, { note, followUpDate });
    return res.data;
  },
};
