import api from './api';
import type { ApiResponse, MovementType, StockMovement } from '../types';

export interface StockQueryParams {
  page?: number;
  limit?: number;
  productId?: string;
  movementType?: MovementType;
}

export interface CreateStockMovementDTO {
  productId: string;
  quantity: number;
  movementType: MovementType;
  reason?: string;
}

export const stockService = {
  async getAll(params?: StockQueryParams): Promise<ApiResponse<StockMovement[]>> {
    const res = await api.get<ApiResponse<StockMovement[]>>('/stock-movements', { params });
    return res.data;
  },

  async createMovement(data: CreateStockMovementDTO): Promise<ApiResponse<StockMovement>> {
    const res = await api.post<ApiResponse<StockMovement>>('/stock-movements', data);
    return res.data;
  },
};
