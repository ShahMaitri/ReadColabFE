import { comparePassword, hashPassword } from './password';
import { signAccessToken, signRefreshToken } from './jwt';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/appError';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    // Validate input
    if (!data.email || !data.password || !data.name) {
      throw new AppError('Email, password, and name are required', 400);
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name
    });

    // Generate tokens
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Validate input
    if (!credentials.email || !credentials.password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user
    const user = await userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;

      const user = await userRepository.findById(decoded.sub);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const tokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role
      };

      const newAccessToken = signAccessToken(tokenPayload);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    } catch (error) {
      throw new AppError('Invalid or expired access token', 401);
    }
  }

  async logout(): Promise<void> {
    // In a stateless JWT system, logout is handled on the client
    // by removing tokens. This method is a placeholder for future
    // token blacklisting implementation if needed.
  }
}

export const authService = new AuthService();
