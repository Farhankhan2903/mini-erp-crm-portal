/**
 * Sales Challan Repository
 *
 * Encapsulates Prisma database access for Sales Challans and Challan Items.
 */

import { SalesChallan, Prisma } from '@prisma/client';
import prisma from '../prisma';
import type { ChallanQueryOptions, PaginatedResult } from '../interfaces';

export class ChallanRepository {
  static async findAll(options: ChallanQueryOptions): Promise<PaginatedResult<SalesChallan>> {
    const page  = Math.max(1, options.page  || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip  = (page - 1) * limit;

    const where: Prisma.SalesChallanWhereInput = {};

    if (options.status)     where.status     = options.status;
    if (options.customerId) where.customerId = options.customerId;

    if (options.search) {
      const term = options.search.trim();
      where.OR = [
        { challanNumber: { contains: term } },
        { customer:      { name: { contains: term } } },
        { customer:      { businessName: { contains: term } } },
      ];
    }

    const sortBy    = options.sortBy    || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const [total, data] = await Promise.all([
      prisma.salesChallan.count({ where }),
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer:  { select: { id: true, name: true, businessName: true, email: true, mobile: true } },
          createdBy: { select: { id: true, name: true, role: true } },
          items:     true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      pagination: { page, limit, total, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
    };
  }

  static async findById(id: string): Promise<SalesChallan | null> {
    return prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer:  { select: { id: true, name: true, businessName: true, email: true, mobile: true, address: true, gst: true } },
        createdBy: { select: { id: true, name: true, role: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, stock: true, unitPrice: true } },
          },
        },
      },
    });
  }

  static async findByChallanNumber(challanNumber: string): Promise<SalesChallan | null> {
    return prisma.salesChallan.findUnique({ where: { challanNumber } });
  }

  static async countTodayChallans(datePrefix: string): Promise<number> {
    return prisma.salesChallan.count({
      where: {
        challanNumber: { startsWith: `SCH-${datePrefix}` },
      },
    });
  }
}
