import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import { requestLogger } from './middleware/requestLogger';
import { apiRouter } from './routes';

export const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Office Library API'
  });
});

app.use(env.API_PREFIX, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
