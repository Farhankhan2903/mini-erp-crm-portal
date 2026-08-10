import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendSuccess } from '../utils/response';
import { CustomerStatus, CustomerType } from '../types/enums';

export class CustomerController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.create(req.body);
      sendSuccess(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, status, customerType, sortBy, sortOrder } = req.query;

      const result = await CustomerService.getAll({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        status: status as CustomerStatus,
        customerType: customerType as CustomerType,
        sortBy: sortBy as 'createdAt' | 'name' | 'status' | 'followUpDate',
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      sendSuccess(res, result.data, 'Customers retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customer = await CustomerService.getById(id);
      sendSuccess(res, customer, 'Customer detail retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customer = await CustomerService.update(id, req.body);
      sendSuccess(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await CustomerService.delete(id);
      sendSuccess(res, null, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async addFollowUpNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customer = await CustomerService.addFollowUpNote(id, req.body);
      sendSuccess(res, customer, 'Follow-up note added successfully');
    } catch (error) {
      next(error);
    }
  }
}
