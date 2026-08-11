/**
 * Core domain interfaces for the Mini ERP + CRM Operations Portal.
 *
 * These interfaces define the contracts (shapes) for domain entities,
 * service DTOs, and repository method signatures, enabling dependency inversion
 * and making services independently testable.
 */

import type { Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '../types/enums';

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ─────────────────────────────────────────────
// API Response
// ─────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string | null;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

// ─────────────────────────────────────────────
// Customer
// ─────────────────────────────────────────────

export interface CreateCustomerDTO {
  name: string;
  mobile: string;
  email: string;
  businessName?: string;
  gst?: string;
  customerType: CustomerType;
  address?: string;
  status?: CustomerStatus;
  notes?: string;
}

export type UpdateCustomerDTO = Partial<CreateCustomerDTO>;

export interface CustomerQueryOptions extends PaginationOptions {
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
  sortBy?: 'createdAt' | 'name' | 'status' | 'followUpDate';
  sortOrder?: 'asc' | 'desc';
}

export interface AddNoteDTO {
  note: string;
  followUpDate?: string;
}

// ─────────────────────────────────────────────
// Product
// ─────────────────────────────────────────────

export interface CreateProductDTO {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  stock?: number;
  minimumStock?: number;
  warehouse: string;
}

export type UpdateProductDTO = Partial<CreateProductDTO>;

export interface ProductQueryOptions extends PaginationOptions {
  search?: string;
  category?: string;
  warehouse?: string;
  lowStock?: boolean;
  sortBy?: 'createdAt' | 'name' | 'sku' | 'stock' | 'unitPrice';
  sortOrder?: 'asc' | 'desc';
}

// ─────────────────────────────────────────────
// Stock Movement
// ─────────────────────────────────────────────

export interface CreateStockMovementDTO {
  productId: string;
  quantity: number;
  movementType: MovementType;
  reason?: string;
  createdById: string;
}

export interface StockMovementQueryOptions extends PaginationOptions {
  productId?: string;
  movementType?: MovementType;
}

// ─────────────────────────────────────────────
// Sales Challan
// ─────────────────────────────────────────────

export interface ChallanItemDTO {
  productId: string;
  quantity: number;
}

export interface CreateChallanDTO {
  customerId: string;
  status?: ChallanStatus;
  items: ChallanItemDTO[];
}

export interface UpdateChallanStatusDTO {
  status: ChallanStatus;
}

export interface ChallanQueryOptions extends PaginationOptions {
  search?: string;
  customerId?: string;
  status?: ChallanStatus;
  sortBy?: 'createdAt' | 'challanNumber' | 'status' | 'totalQuantity';
  sortOrder?: 'asc' | 'desc';
}
