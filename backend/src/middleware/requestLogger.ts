import morgan from 'morgan';
import { logger } from '../config/logger';

const stream = {
  write: (message: string): void => {
    logger.info(message.trim());
  }
};

export const requestLogger = morgan('combined', { stream });
