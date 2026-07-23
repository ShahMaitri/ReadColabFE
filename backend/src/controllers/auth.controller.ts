import { Request, Response, NextFunction } from 'express';
import { authService } from '../auth';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password, name } = req.body;

    const response = await authService.register({ email, password, name });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: response
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;

    const response = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: response
    });
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const response = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Access token refreshed',
      data: response
    });
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    await authService.logout();

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  }
);

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = (req as any).user;

    res.status(200).json({
      success: true,
      message: 'Current user retrieved',
      data: user
    });
  }
);
