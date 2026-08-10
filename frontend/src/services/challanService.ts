import api from './api';
import type { ApiResponse, ChallanStatus, SalesChallan } from '../types';

export interface ChallanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: ChallanStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateChallanDTO {
  customerId: string;
  status?: ChallanStatus;
  items: Array<{ productId: string; quantity: number }>;
}

export const challanService = {
  async getAll(params?: ChallanQueryParams): Promise<ApiResponse<SalesChallan[]>> {
    const res = await api.get<ApiResponse<SalesChallan[]>>('/sales-challans', { params });
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<SalesChallan>> {
    const res = await api.get<ApiResponse<SalesChallan>>(`/sales-challans/${id}`);
    return res.data;
  },

  async create(data: CreateChallanDTO): Promise<ApiResponse<SalesChallan>> {
    const res = await api.post<ApiResponse<SalesChallan>>('/sales-challans', data);
    return res.data;
  },

  async updateStatus(id: string, status: ChallanStatus): Promise<ApiResponse<SalesChallan>> {
    const res = await api.patch<ApiResponse<SalesChallan>>(`/sales-challans/${id}/status`, { status });
    return res.data;
  },
};
