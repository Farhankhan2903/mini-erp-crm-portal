export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'CORPORATE';
export type CustomerStatus = 'LEAD' | 'PROSPECT' | 'ACTIVE' | 'INACTIVE';

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  note: string;
  followUpDate?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName?: string;
  gst?: string;
  customerType: CustomerType;
  address?: string;
  status: CustomerStatus;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  notesHistory?: CustomerNote[];
  salesChallans?: SalesChallan[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  stock: number;
  minimumStock: number;
  warehouse: string;
  createdAt: string;
  updatedAt: string;
  stockMovements?: StockMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: Partial<Product>;
  quantity: number;
  movementType: MovementType;
  reason?: string;
  createdById: string;
  createdBy?: Partial<User>;
  timestamp: string;
  createdAt: string;
}

export interface SalesChallanItem {
  id: string;
  salesChallanId: string;
  productId?: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  createdAt: string;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: Partial<Customer>;
  status: ChallanStatus;
  totalQuantity: number;
  createdById: string;
  createdBy?: Partial<User>;
  createdAt: string;
  updatedAt: string;
  items: SalesChallanItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  error?: unknown;
}
