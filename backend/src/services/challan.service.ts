import { SalesChallan, Prisma } from '@prisma/client';
import { ChallanStatus, MovementType } from '../types/enums';
import prisma from '../prisma';
import { AppError } from '../middlewares/errorHandler';
import { PaginatedResult } from './customer.service';

export interface CreateChallanItemDTO {
  productId: string;
  quantity: number;
}

export interface CreateChallanDTO {
  customerId: string;
  status?: ChallanStatus;
  items: CreateChallanItemDTO[];
  createdById: string;
}

export interface ChallanQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: ChallanStatus;
  sortBy?: 'createdAt' | 'challanNumber' | 'status' | 'totalQuantity';
  sortOrder?: 'asc' | 'desc';
}

export class ChallanService {
  private static async generateChallanNumber(): Promise<string> {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `SCH-${todayStr}-`;

    const countToday = await prisma.salesChallan.count({
      where: {
        challanNumber: { startsWith: prefix },
      },
    });

    const sequence = String(countToday + 1).padStart(4, '0');
    return `${prefix}${sequence}`;
  }

  static async create(dto: CreateChallanDTO): Promise<SalesChallan> {
    return prisma.$transaction(async (tx) => {
      // 1. Verify Customer
      const customer = await tx.customer.findUnique({
        where: { id: dto.customerId },
      });

      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      // 2. Fetch Products for Snapshot & Stock Check
      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== dto.items.length) {
        throw new AppError('One or more products specified in the items were not found', 400);
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      // 3. Build Historical Product Snapshot Items
      let totalQuantity = 0;
      const challanItemsData = dto.items.map((item) => {
        const product = productMap.get(item.productId)!;
        totalQuantity += item.quantity;

        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          price: product.unitPrice,
          quantity: item.quantity,
        };
      });

      // 4. Generate Automatic Challan Number
      const challanNumber = await this.generateChallanNumber();

      const initialStatus = dto.status || ChallanStatus.DRAFT;

      // 5. Create Sales Challan Record
      const challan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: dto.customerId,
          status: initialStatus,
          totalQuantity,
          createdById: dto.createdById,
          items: {
            create: challanItemsData,
          },
        },
        include: {
          customer: { select: { id: true, name: true, email: true, mobile: true } },
          createdBy: { select: { id: true, name: true, role: true } },
          items: true,
        },
      });

      // 6. If created directly with CONFIRMED or DISPATCHED status, trigger stock deduction
      if (initialStatus === ChallanStatus.CONFIRMED || initialStatus === ChallanStatus.DISPATCHED) {
        await this.processStockDeduction(tx, challan.id, dto.createdById);
      }

      return challan;
    });
  }

  private static async processStockDeduction(
    tx: Prisma.TransactionClient,
    challanId: string,
    userId: string
  ): Promise<void> {
    const challan = await tx.salesChallan.findUnique({
      where: { id: challanId },
      include: { items: true },
    });

    if (!challan) return;

    for (const item of challan.items) {
      if (item.productId) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          // Negative Stock Prevention Business Rule
          if (product.stock < item.quantity) {
            throw new AppError(
              `Insufficient stock for '${product.name}' (SKU: ${product.sku}). Available stock: ${product.stock}, requested quantity: ${item.quantity}`,
              400
            );
          }

          // Atomic stock reduction
          await tx.product.update({
            where: { id: product.id },
            data: { stock: product.stock - item.quantity },
          });

          // Log Stock Movement OUT
          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantity: item.quantity,
              movementType: MovementType.OUT,
              reason: `Stock deduction for Sales Challan #${challan.challanNumber}`,
              createdById: userId,
            },
          });
        }
      }
    }
  }

  static async getAll(options: ChallanQueryOptions): Promise<PaginatedResult<SalesChallan>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SalesChallanWhereInput = {};

    if (options.customerId) where.customerId = options.customerId;
    if (options.status) where.status = options.status;

    if (options.search) {
      const searchTerm = options.search.trim();
      where.OR = [
        { challanNumber: { contains: searchTerm } },
        { customer: { name: { contains: searchTerm } } },
        { customer: { businessName: { contains: searchTerm } } },
      ];
    }

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const [total, data] = await Promise.all([
      prisma.salesChallan.count({ where }),
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: { select: { id: true, name: true, email: true, mobile: true, businessName: true } },
          createdBy: { select: { id: true, name: true, role: true } },
          items: true,
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

  static async getById(id: string): Promise<SalesChallan> {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, role: true, email: true } },
        items: true,
      },
    });

    if (!challan) {
      throw new AppError('Sales Challan not found', 404);
    }

    return challan;
  }

  static async updateStatus(
    id: string,
    newStatus: ChallanStatus,
    userId: string
  ): Promise<SalesChallan> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.salesChallan.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new AppError('Sales Challan not found', 404);
      }

      if (existing.status === ChallanStatus.CANCELLED) {
        throw new AppError('Cannot modify a cancelled Sales Challan', 400);
      }

      if (existing.status === ChallanStatus.DELIVERED) {
        throw new AppError('Cannot modify a delivered Sales Challan', 400);
      }

      // Check if transitioning from DRAFT to CONFIRMED or DISPATCHED
      if (
        existing.status === ChallanStatus.DRAFT &&
        (newStatus === ChallanStatus.CONFIRMED || newStatus === ChallanStatus.DISPATCHED)
      ) {
        await this.processStockDeduction(tx, id, userId);
      }

      return tx.salesChallan.update({
        where: { id },
        data: { status: newStatus },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true, role: true } },
          items: true,
        },
      });
    });
  }
}
