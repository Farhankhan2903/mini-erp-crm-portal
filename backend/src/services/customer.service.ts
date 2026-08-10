import { Customer, Prisma } from '@prisma/client';
import { CustomerStatus, CustomerType } from '../types/enums';
import prisma from '../prisma';
import { AppError } from '../middlewares/errorHandler';

export interface CreateCustomerDTO {
  name: string;
  mobile: string;
  email: string;
  businessName?: string;
  gst?: string;
  customerType?: CustomerType;
  address?: string;
  status?: CustomerStatus;
  followUpDate?: Date;
  notes?: string;
}

export interface CustomerQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
  sortBy?: 'createdAt' | 'name' | 'status' | 'followUpDate';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
}

export class CustomerService {
  static async create(dto: CreateCustomerDTO): Promise<Customer> {
    return prisma.customer.create({
      data: dto,
    });
  }

  static async getAll(options: CustomerQueryOptions): Promise<PaginatedResult<Customer>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (options.status) where.status = options.status;
    if (options.customerType) where.customerType = options.customerType;

    if (options.search) {
      const searchTerm = options.search.trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { mobile: { contains: searchTerm } },
        { businessName: { contains: searchTerm } },
        { gst: { contains: searchTerm } },
      ];
    }

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const [total, data] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          notesHistory: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
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

  static async getById(id: string): Promise<Customer> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        notesHistory: {
          orderBy: { createdAt: 'desc' },
        },
        salesChallans: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }

  static async update(id: string, dto: Partial<CreateCustomerDTO>): Promise<Customer> {
    await this.getById(id);
    return prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  static async delete(id: string): Promise<void> {
    await this.getById(id);
    await prisma.customer.delete({
      where: { id },
    });
  }

  static async addFollowUpNote(
    id: string,
    dto: { note: string; followUpDate?: Date }
  ): Promise<Customer> {
    const customer = await this.getById(id);

    return prisma.$transaction(async (tx) => {
      // Record historical note
      await tx.customerNote.create({
        data: {
          customerId: id,
          note: dto.note,
          followUpDate: dto.followUpDate,
        },
      });

      // Append note text to main notes summary
      const updatedNoteSummary = customer.notes
        ? `${customer.notes}\n[${new Date().toISOString().slice(0, 10)}] ${dto.note}`
        : `[${new Date().toISOString().slice(0, 10)}] ${dto.note}`;

      return tx.customer.update({
        where: { id },
        data: {
          notes: updatedNoteSummary,
          followUpDate: dto.followUpDate || customer.followUpDate,
        },
        include: {
          notesHistory: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  }
}
