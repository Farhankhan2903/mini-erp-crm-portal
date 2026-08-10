import { Router } from 'express';
import { Role } from '../types/enums';
import { ProductController } from '../controllers/product.controller';
import { authenticateUser, authorizeRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

router.use(authenticateUser);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validate(createProductSchema),
  ProductController.create
);
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validate(updateProductSchema),
  ProductController.update
);
router.delete('/:id', authorizeRoles(Role.ADMIN), ProductController.delete);

export default router;
