import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { Role } from '../types/enums';
import prisma from '../prisma';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export class AuthService {
  static async login(dto: LoginDTO): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _pw, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword as Omit<User, 'password'> };
  }

  static async register(dto: RegisterDTO): Promise<Omit<User, 'password'>> {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        role: dto.role,
      },
    });

    const { password: _pw, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  static async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password: _pw, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }
}
