import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../auth';
import { AppError } from '../utils/appError';
import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authorization token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyAccessToken(token);

    (req as any).user = {
      ...decoded,
      id: decoded.sub
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const authenticateAsync = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authorization token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded = await authService.verifyAccessToken(token);

    (req as any).user = {
      ...decoded,
      id: decoded.sub
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
      return;
    }

    next();
  };
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
    return;
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    res.status(403).json({
      success: false,
      message: 'Only admins can access this resource'
    });
    return;
  }

  next();
};

export const isSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
    return;
  }

  if (user.role !== 'SUPER_ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Only super admins can access this resource'
    });
    return;
  }

  next();
};
