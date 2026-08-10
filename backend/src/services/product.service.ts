import { Product, Prisma } from '@prisma/client';
import prisma from '../prisma';
import { AppError } from '../middlewares/errorHandler';
import { PaginatedResult } from './customer.service';

export interface CreateProductDTO {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  stock?: number;
  minimumStock?: number;
  warehouse: string;
}

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  warehouse?: string;
  lowStock?: boolean;
  sortBy?: 'createdAt' | 'name' | 'sku' | 'stock' | 'unitPrice';
  sortOrder?: 'asc' | 'desc';
}

export class ProductService {
  static async create(dto: CreateProductDTO): Promise<Product> {
    const formattedSku = dto.sku.trim().toUpperCase();

    const existing = await prisma.product.findUnique({
      where: { sku: formattedSku },
    });

    if (existing) {
      throw new AppError(`Product with SKU '${formattedSku}' already exists`, 400);
    }

    return prisma.product.create({
      data: {
        ...dto,
        sku: formattedSku,
      },
    });
  }

  static async getAll(options: ProductQueryOptions): Promise<PaginatedResult<Product>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (options.category) where.category = options.category;
    if (options.warehouse) where.warehouse = options.warehouse;

    if (options.search) {
      const searchTerm = options.search.trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { sku: { contains: searchTerm } },
        { category: { contains: searchTerm } },
        { warehouse: { contains: searchTerm } },
      ];
    }

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const [total, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    let finalData = data;
    let finalTotal = total;

    if (options.lowStock) {
      const allMatching = await prisma.product.findMany({
        where: {
          category: options.category,
          warehouse: options.warehouse,
          OR: where.OR,
        },
        orderBy: { [sortBy]: sortOrder },
      });

      const filteredLowStock = allMatching.filter((p) => p.stock <= p.minimumStock);
      finalTotal = filteredLowStock.length;
      finalData = filteredLowStock.slice(skip, skip + limit);
    }

    const totalPages = Math.ceil(finalTotal / limit) || 1;

    return {
      data: finalData,
      pagination: {
        page,
        limit,
        total: finalTotal,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
    };
  }

  static async getById(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          take: 15,
          orderBy: { timestamp: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, role: true, email: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  static async update(id: string, dto: Partial<CreateProductDTO>): Promise<Product> {
    await this.getById(id);

    if (dto.sku) {
      const formattedSku = dto.sku.trim().toUpperCase();
      const existing = await prisma.product.findUnique({
        where: { sku: formattedSku },
      });
      if (existing && existing.id !== id) {
        throw new AppError(`Product with SKU '${formattedSku}' already exists`, 400);
      }
      dto.sku = formattedSku;
    }

    return prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  static async delete(id: string): Promise<void> {
    await this.getById(id);
    await prisma.product.delete({
      where: { id },
    });
  }
}
