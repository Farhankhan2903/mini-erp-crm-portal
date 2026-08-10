import { z } from 'zod';
import { ChallanStatus } from '../types/enums';

const challanItemSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  quantity: z.number().int().positive('Item quantity must be greater than zero'),
});

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid Customer ID'),
    status: z.nativeEnum(ChallanStatus).default(ChallanStatus.DRAFT),
    items: z.array(challanItemSchema).min(1, 'Sales Challan must contain at least one product item'),
  }),
});

export const updateChallanStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Challan ID'),
  }),
  body: z.object({
    status: z.nativeEnum(ChallanStatus),
  }),
});

export const challanQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 10)),
    search: z.string().optional(),
    customerId: z.string().uuid('Invalid Customer ID').optional(),
    status: z.nativeEnum(ChallanStatus).optional(),
    sortBy: z.enum(['createdAt', 'challanNumber', 'status', 'totalQuantity']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});
