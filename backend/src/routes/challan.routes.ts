import { Router } from 'express';
import { Role } from '../types/enums';
import { ChallanController } from '../controllers/challan.controller';
import { authenticateUser, authorizeRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createChallanSchema, updateChallanStatusSchema } from '../validators/challan.validator';

const router = Router();

router.use(authenticateUser);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validate(createChallanSchema),
  ChallanController.create
);
router.get('/', ChallanController.getAll);
router.get('/:id', ChallanController.getById);
router.patch(
  '/:id/status',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE),
  validate(updateChallanStatusSchema),
  ChallanController.updateStatus
);

export default router;
