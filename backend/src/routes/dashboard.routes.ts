import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateUser } from '../middlewares/auth';

const router = Router();

router.use(authenticateUser);

// GET /dashboard/metrics (or /api/v1/dashboard/metrics)
router.get('/metrics', DashboardController.getMetrics);
router.get('/', DashboardController.getMetrics);

export default router;
