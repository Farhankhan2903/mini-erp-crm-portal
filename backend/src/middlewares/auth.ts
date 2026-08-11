import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../types/enums';
import { env } from '../config/env';
import { sendError } from '../utils/response';
import { AuthUser } from '../types/express';

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication token required. Format: Bearer <token>', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    sendError(res, 'Invalid or expired authentication token', 401);
  }

};

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthenticated user context', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized. Allowed roles: [${allowedRoles.join(', ')}]`,
        403
      );
      return;
    }

    next();
  };
};

// Aliases for backward compatibility
export const authenticate = authenticateUser;
export const authorize = authorizeRoles;
