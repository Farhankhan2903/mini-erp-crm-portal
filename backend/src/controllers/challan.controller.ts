import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { sendSuccess } from '../utils/response';
import { ChallanStatus } from '../types/enums';

export class ChallanController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challan = await ChallanService.create({
        ...req.body,
        createdById: req.user!.id,
      });
      sendSuccess(res, challan, 'Sales Challan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, customerId, status, sortBy, sortOrder } = req.query;

      const result = await ChallanService.getAll({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        customerId: customerId as string,
        status: status as ChallanStatus,
        sortBy: sortBy as 'createdAt' | 'challanNumber' | 'status' | 'totalQuantity',
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      sendSuccess(res, result.data, 'Sales Challans retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const challan = await ChallanService.getById(id);
      sendSuccess(res, challan, 'Sales Challan detail retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const challan = await ChallanService.updateStatus(
        id,
        req.body.status as ChallanStatus,
        req.user!.id
      );
      sendSuccess(res, challan, `Sales Challan status updated to ${req.body.status}`);
    } catch (error) {
      next(error);
    }
  }
}
