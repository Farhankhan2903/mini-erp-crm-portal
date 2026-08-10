import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  static async getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await DashboardService.getMetrics();
      sendSuccess(res, metrics, 'Dashboard metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
