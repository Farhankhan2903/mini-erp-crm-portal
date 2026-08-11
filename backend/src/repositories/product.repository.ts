/**
 * Product Repository
 *
 * Encapsulates all direct Prisma database operations for the Product domain.
 */

import { Product, Prisma } from '@prisma/client';
import prisma from '../prisma';
import type { CreateProductDTO, ProductQueryOptions, PaginatedResult } from '../interfaces';

export class ProductRepository {
  static async findAll(options: ProductQueryOptions): Promise<PaginatedResult<Product>> {
    const page  = Math.max(1, options.page  || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip  = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (options.category)  where.category  = options.category;
    if (options.warehouse) where.warehouse  = options.warehouse;

    if (options.search) {
      const term = options.search.trim();
      where.OR = [
        { name:      { contains: term } },
        { sku:       { contains: term } },
        { category:  { contains: term } },
        { warehouse: { contains: term } },
      ];
    }

    const sortBy    = options.sortBy    || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    // Low-stock filter requires post-query filtering (stock <= minimumStock is a cross-column comparison)
    if (options.lowStock) {
      const allMatching = await prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
      });
      const filtered    = allMatching.filter((p) => p.stock <= p.minimumStock);
      const total       = filtered.length;
      const totalPages  = Math.ceil(total / limit) || 1;

      return {
        data:       filtered.slice(skip, skip + limit),
        pagination: { page, limit, total, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
      };
    }

    const [total, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      pagination: { page, limit, total, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
    };
  }

  static async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          take: 15,
          orderBy: { timestamp: 'desc' },
          include: { createdBy: { select: { id: true, name: true, role: true, email: true } } },
        },
      },
    });
  }

  static async findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { sku } });
  }

  static async create(dto: CreateProductDTO): Promise<Product> {
    return prisma.product.create({
      data: { ...dto, sku: dto.sku.trim().toUpperCase() },
    });
  }

  static async update(id: string, dto: Partial<CreateProductDTO>): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { ...dto, ...(dto.sku && { sku: dto.sku.trim().toUpperCase() }) },
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
}
