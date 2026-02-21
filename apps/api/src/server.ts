import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient, Role } from '@prisma/client';
import { AuthController } from './controllers/AuthController';
import { authenticate, authorize, AuthRequest } from './middleware/auth';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Public routes
app.post('/auth/login', AuthController.login);

// Protected route examples fulfilling requirements
app.get('/api/protected/manager', authenticate, authorize([Role.MANAGER]), (req: Request, res: Response) => {
    res.json({ message: 'Manager dashboard access granted', user: (req as AuthRequest).user });
});

app.get('/api/protected/dispatch', authenticate, authorize([Role.MANAGER, Role.DISPATCHER]), (req: Request, res: Response) => {
    res.json({ message: 'Dispatcher portal access granted', user: (req as AuthRequest).user });
});

app.get('/api/protected/safety', authenticate, authorize([Role.MANAGER, Role.SAFETY_OFFICER]), (req: Request, res: Response) => {
    res.json({ message: 'Safety Officer access granted', user: (req as AuthRequest).user });
});

app.get('/api/protected/finance', authenticate, authorize([Role.MANAGER, Role.FINANCIAL_ANALYST]), (req: Request, res: Response) => {
    res.json({ message: 'Financial Analyst access granted', user: (req as AuthRequest).user });
});

// Basic health-check route
app.get('/health', async (req: Request, res: Response) => {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'healthy', database: 'connected' });
    } catch (error) {
        console.error('Database connection failed', error);
        res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: String(error) });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
