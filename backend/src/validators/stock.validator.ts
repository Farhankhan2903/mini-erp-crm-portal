import { z } from 'zod';
import { MovementType } from '../types/enums';

export const createStockMovementSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid Product ID'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    movementType: z.nativeEnum(MovementType),
    reason: z.string().optional(),
  }),
});

export const stockQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 10)),
    productId: z.string().uuid('Invalid Product ID').optional(),
    movementType: z.nativeEnum(MovementType).optional(),
  }),
});
