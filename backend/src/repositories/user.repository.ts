import { prisma } from '../config/prisma';
import { User } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
}

export class UserRepository {
  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'EMPLOYEE'
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findAll(): Promise<Array<Pick<User, 'id' | 'email' | 'name' | 'role' | 'avatar' | 'createdAt' | 'updatedAt'>>> {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  async updateRole(id: string, role: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role }
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id }
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    return !!user;
  }
}

export const userRepository = new UserRepository();
