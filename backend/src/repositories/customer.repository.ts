/**
 * Customer Repository
 *
 * Encapsulates all direct Prisma database operations for the Customer domain.
 * Services call this layer instead of calling Prisma directly, making the
 * data access logic testable and swappable.
 */

import { Customer, CustomerNote, Prisma } from '@prisma/client';
import prisma from '../prisma';
import type { CreateCustomerDTO, CustomerQueryOptions, PaginatedResult } from '../interfaces';

export class CustomerRepository {
  static async findAll(options: CustomerQueryOptions): Promise<PaginatedResult<Customer>> {
    const page  = Math.max(1, options.page  || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip  = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (options.status)       where.status       = options.status;
    if (options.customerType) where.customerType = options.customerType;

    if (options.search) {
      const term = options.search.trim();
      where.OR = [
        { name:         { contains: term } },
        { email:        { contains: term } },
        { mobile:       { contains: term } },
        { businessName: { contains: term } },
        { gst:          { contains: term } },
        { address:      { contains: term } },
      ];
    }

    const sortBy    = options.sortBy    || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const [total, data] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      pagination: { page, limit, total, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
    };
  }

  static async findById(id: string): Promise<(Customer & { notesHistory: CustomerNote[] }) | null> {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        notesHistory: { orderBy: { createdAt: 'desc' } },
        salesChallans: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            items:     true,
            createdBy: { select: { id: true, name: true, role: true } },
          },
        },
      },
    }) as Promise<(Customer & { notesHistory: CustomerNote[] }) | null>;
  }

  static async create(dto: CreateCustomerDTO): Promise<Customer> {
    return prisma.customer.create({
      data: {
        ...dto,
        email: dto.email.toLowerCase().trim(),
        status: dto.status || 'LEAD',
      },
    });
  }

  static async update(id: string, dto: Partial<CreateCustomerDTO>): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data: { ...dto, ...(dto.email && { email: dto.email.toLowerCase().trim() }) },
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.customer.delete({ where: { id } });
  }

  static async addNote(
    customerId: string,
    note: string,
    followUpDate?: string,
  ): Promise<Customer & { notesHistory: CustomerNote[] }> {
    return prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(followUpDate && { followUpDate: new Date(followUpDate) }),
        notesHistory: { create: { note, followUpDate: followUpDate ? new Date(followUpDate) : undefined } },
      },
      include: { notesHistory: { orderBy: { createdAt: 'desc' } } },
    }) as Promise<Customer & { notesHistory: CustomerNote[] }>;
  }
}
