import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name is required'),
    sku: z.string().min(2, 'SKU is required'),
    category: z.string().min(2, 'Category is required'),
    unitPrice: z.number().positive('Unit price must be greater than zero'),
    stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
    minimumStock: z.number().int().nonnegative('Minimum stock cannot be negative').default(0),
    warehouse: z.string().min(2, 'Warehouse location is required'),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Product ID'),
  }),
  body: createProductSchema.shape.body.partial(),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 10)),
    search: z.string().optional(),
    category: z.string().optional(),
    warehouse: z.string().optional(),
    lowStock: z.string().optional().transform((val) => val === 'true'),
    sortBy: z.enum(['createdAt', 'name', 'sku', 'stock', 'unitPrice']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});
