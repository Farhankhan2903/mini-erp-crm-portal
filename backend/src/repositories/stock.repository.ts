/**
 * Stock Movement Repository
 *
 * Encapsulates Prisma database operations for Stock Movements.
 */

import { StockMovement, Prisma } from '@prisma/client';
import prisma from '../prisma';
import type { StockMovementQueryOptions, PaginatedResult } from '../interfaces';

export class StockRepository {
  static async findAll(options: StockMovementQueryOptions): Promise<PaginatedResult<StockMovement>> {
    const page  = Math.max(1, options.page  || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip  = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {};
    if (options.productId)    where.productId    = options.productId;
    if (options.movementType) where.movementType = options.movementType;

    const [total, data] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          product:   { select: { id: true, name: true, sku: true, category: true, warehouse: true } },
          createdBy: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      pagination: { page, limit, total, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
    };
  }

  static async findById(id: string): Promise<StockMovement | null> {
    return prisma.stockMovement.findUnique({
      where: { id },
      include: {
        product:   { select: { id: true, name: true, sku: true, stock: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }
}
