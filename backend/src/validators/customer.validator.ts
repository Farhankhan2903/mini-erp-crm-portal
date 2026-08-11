import { z } from 'zod';
import { CustomerType, CustomerStatus } from '../types/enums';

// Indian 10-digit mobile number regex (starts with 6, 7, 8, 9, optional +91 prefix)
const indianMobileRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;

// GSTIN 15-character alphanumeric regex format
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Customer name must be at least 2 characters'),
    mobile: z
      .string()
      .regex(indianMobileRegex, 'Must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'),
    email: z.string().email('Invalid email address'),
    businessName: z.string().optional(),
    gst: z
      .string()
      .optional()
      .transform((val) => (val ? val.trim().toUpperCase() : undefined))
      .refine((val) => !val || gstinRegex.test(val), {
        message: 'Invalid GSTIN format (e.g. 24AAACP1234A1Z5)',
      }),
    customerType: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
    address: z.string().optional(),
    status: z.nativeEnum(CustomerStatus).default(CustomerStatus.ACTIVE),
    followUpDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    notes: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Customer ID'),
  }),
  body: createCustomerSchema.shape.body.partial(),
});

export const customerQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 10)),
    search: z.string().optional(),
    status: z.nativeEnum(CustomerStatus).optional(),
    customerType: z.nativeEnum(CustomerType).optional(),
    sortBy: z.enum(['createdAt', 'name', 'status', 'followUpDate']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const addFollowUpNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Customer ID'),
  }),
  body: z.object({
    note: z.string().min(1, 'Follow-up note content is required'),
    followUpDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  }),
});
