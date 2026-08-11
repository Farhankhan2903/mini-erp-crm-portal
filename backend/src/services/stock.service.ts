import { StockMovement, Prisma } from '@prisma/client';
import { MovementType } from '../types/enums';
import prisma from '../prisma';
import { AppError } from '../middlewares/errorHandler';
import { PaginatedResult } from './customer.service';

export interface CreateStockMovementDTO {
  productId: string;
  quantity: number;
  movementType: MovementType;
  reason?: string;
  createdById: string;
}

export interface StockMovementQueryOptions {
  page?: number;
  limit?: number;
  productId?: string;
  movementType?: MovementType;
}

export class StockService {
  static async createMovement(dto: CreateStockMovementDTO): Promise<StockMovement> {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      let newStock = product.stock;

      if (dto.movementType === MovementType.IN) {
        newStock += dto.quantity;
      } else if (dto.movementType === MovementType.OUT) {
        if (product.stock < dto.quantity) {
          throw new AppError(
            `Insufficient stock for '${product.name}' (SKU: ${product.sku}). Available stock: ${product.stock}, requested: ${dto.quantity}`,
            400
          );
        }
        newStock -= dto.quantity;
      } else if (dto.movementType === MovementType.ADJUSTMENT) {
        newStock = dto.quantity;
      }

      // Atomic update of current stock
      await tx.product.update({
        where: { id: dto.productId },
        data: { stock: newStock },
      });

      // Record movement entry
      return tx.stockMovement.create({
        data: {
          productId: dto.productId,
          quantity: dto.quantity,
          movementType: dto.movementType,
          reason: dto.reason || `Manual ${dto.movementType} adjustment`,
          createdById: dto.createdById,
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true, stock: true, minimumStock: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });
    });
  }

  static async getAll(options: StockMovementQueryOptions): Promise<PaginatedResult<StockMovement>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {};
    if (options.productId) where.productId = options.productId;
    if (options.movementType) where.movementType = options.movementType;

    const [total, data] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true, category: true, warehouse: true } },
          createdBy: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
    };
  }
}
