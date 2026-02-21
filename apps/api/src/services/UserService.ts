import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError } from '../errors/DomainError';
import { User, Prisma } from '@prisma/client';

export class UserService {
    public static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    public static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    public static async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    public static async createUser(data: Prisma.UserCreateInput): Promise<User> {
        const existingUser = await this.findByEmail(data.email);
        if (existingUser) {
            throw new ValidationError('Email already exists');
        }

        const hashedPassword = await this.hashPassword(data.password);
        return prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
    }
}
