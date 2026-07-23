import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

type JwtPayload = Record<string, unknown>;

export const signAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

export const signRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};
