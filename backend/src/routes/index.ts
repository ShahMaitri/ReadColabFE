import { Router } from 'express';
import { env } from '../config/env';
import { v1Router } from './v1';

export const apiRouter = Router();

apiRouter.use(`/${env.API_VERSION}`, v1Router);
