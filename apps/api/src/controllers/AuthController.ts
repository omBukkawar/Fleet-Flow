import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import jwt from 'jsonwebtoken';
import { DomainError, ValidationError } from '../errors/DomainError';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-123';
const JWT_EXPIRES_IN = '24h'; // Tokens expire in 24 hours

export class AuthController {
    public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new ValidationError('Email and password are required');
            }

            const user = await UserService.findByEmail(email);
            if (!user) {
                throw new DomainError('Invalid credentials', 401);
            }

            const isMatch = await UserService.verifyPassword(password, user.password);
            if (!isMatch) {
                throw new DomainError('Invalid credentials', 401);
            }

            // Generate token (expires)
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.status(200).json({
                token,
                user: { id: user.id, email: user.email, role: user.role, name: user.name }
            });
        } catch (error) {
            next(error);
        }
    }
}
