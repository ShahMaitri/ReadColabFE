import { Request, Response } from 'express';

export const healthController = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Smart Office Library backend is healthy',
    timestamp: new Date().toISOString()
  });
};
