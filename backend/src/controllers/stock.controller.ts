import { Request, Response, NextFunction } from 'express';
import { StockService } from '../services/stock.service';
import { sendSuccess } from '../utils/response';
import { MovementType } from '../types/enums';

export class StockController {
  static async createMovement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movement = await StockService.createMovement({
        ...req.body,
        createdById: req.user!.id,
      });
      sendSuccess(res, movement, 'Stock movement recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, productId, movementType } = req.query;

      const result = await StockService.getAll({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        productId: productId as string,
        movementType: movementType as MovementType,
      });

      sendSuccess(res, result.data, 'Stock movements retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}
