import { Router } from 'express';
import { Role } from '../types/enums';
import { CustomerController } from '../controllers/customer.controller';
import { authenticateUser, authorizeRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createCustomerSchema,
  updateCustomerSchema,
  addFollowUpNoteSchema,
} from '../validators/customer.validator';

const router = Router();

router.use(authenticateUser);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validate(createCustomerSchema),
  CustomerController.create
);
router.get('/', CustomerController.getAll);
router.get('/:id', CustomerController.getById);
router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validate(updateCustomerSchema),
  CustomerController.update
);
router.delete('/:id', authorizeRoles(Role.ADMIN), CustomerController.delete);
router.post(
  '/:id/notes',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validate(addFollowUpNoteSchema),
  CustomerController.addFollowUpNote
);

export default router;
