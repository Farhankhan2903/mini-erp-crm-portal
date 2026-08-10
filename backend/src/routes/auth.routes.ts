import { Router } from 'express';
import { Role } from '../types/enums';
import { AuthController } from '../controllers/auth.controller';
import { authenticateUser, authorizeRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post(
  '/register',
  authenticateUser,
  authorizeRoles(Role.ADMIN),
  validate(registerSchema),
  AuthController.register
);
router.get('/me', authenticateUser, AuthController.me);

export default router;
