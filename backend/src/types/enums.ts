export enum Role {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  WAREHOUSE = 'WAREHOUSE',
  ACCOUNTS = 'ACCOUNTS',
}

export enum CustomerType {
  RETAIL = 'RETAIL',
  WHOLESALE = 'WHOLESALE',
  CORPORATE = 'CORPORATE',
}

export enum CustomerStatus {
  LEAD = 'LEAD',
  PROSPECT = 'PROSPECT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum ChallanStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
