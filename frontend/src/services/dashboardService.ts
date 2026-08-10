import api from './api';
import type { ApiResponse } from '../types';

export interface DashboardMetricsData {
  cards: {
    totalCustomers: number;
    totalProducts: number;
    todaysChallans: number;
    lowStockProducts: number;
    totalInventoryValue: number;
  };
  lists: {
    recentChallans: any[];
    recentCustomers: any[];
  };
}

export const dashboardService = {
  async getMetrics(): Promise<ApiResponse<DashboardMetricsData>> {
    const res = await api.get<ApiResponse<DashboardMetricsData>>('/dashboard/metrics');
    return res.data;
  },
};
