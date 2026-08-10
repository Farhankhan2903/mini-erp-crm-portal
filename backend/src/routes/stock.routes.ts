import { Router } from 'express';
import { Role } from '../types/enums';
import { StockController } from '../controllers/stock.controller';
import { authenticateUser, authorizeRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createStockMovementSchema } from '../validators/stock.validator';

const router = Router();

router.use(authenticateUser);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validate(createStockMovementSchema),
  StockController.createMovement
);
router.get('/', StockController.getAll);

export default router;
