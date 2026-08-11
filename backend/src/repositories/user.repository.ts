/**
 * User Repository
 *
 * Encapsulates Prisma database operations for User accounts.
 */

import { User } from '@prisma/client';
import prisma from '../prisma';
import type { RegisterDTO } from '../interfaces';

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async create(dto: RegisterDTO & { password: string }): Promise<User> {
    return prisma.user.create({
      data: {
        name:     dto.name.trim(),
        email:    dto.email.toLowerCase().trim(),
        password: dto.password,
        role:     dto.role,
      },
    });
  }
}
