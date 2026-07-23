import { createLogger, format, transports } from 'winston';
import { env } from './env';

const isProduction = env.NODE_ENV === 'production';

export const logger = createLogger({
  level: env.LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    isProduction ? format.json() : format.combine(format.colorize(), format.simple())
  ),
  transports: [new transports.Console()],
  exitOnError: false
});
