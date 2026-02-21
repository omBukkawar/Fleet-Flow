import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-123';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: Role;
    };
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid token' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        (req as AuthRequest).user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
        return;
    }
}

export function authorize(allowedRoles: Role[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authReq = req as AuthRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        if (!allowedRoles.includes(authReq.user.role)) {
            res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            return;
        }

        next();
    };
}
