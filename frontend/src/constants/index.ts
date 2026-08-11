// Application-wide constants for Mini ERP + CRM Portal

export const APP_NAME = 'Mini ERP + CRM Operations Portal';
export const APP_COMPANY = 'Fundsroom Infotech';
export const APP_VERSION = '1.0.0';

export const ROLES = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as const;
export type AppRole = (typeof ROLES)[number];

export const CUSTOMER_STATUS_OPTIONS = [
  { value: 'LEAD', label: 'Lead' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

export const CUSTOMER_TYPE_OPTIONS = [
  { value: 'RETAIL', label: 'Retail' },
  { value: 'WHOLESALE', label: 'Wholesale' },
  { value: 'CORPORATE', label: 'Corporate' },
] as const;

export const CHALLAN_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export const STOCK_MOVEMENT_TYPES = [
  { value: 'IN', label: 'Stock In' },
  { value: 'OUT', label: 'Stock Out' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
] as const;

export const PAGINATION_LIMIT_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

export const LOCAL_STORAGE_KEYS = {
  JWT_TOKEN: 'minierp_jwt_token',
  USER: 'minierp_user',
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
