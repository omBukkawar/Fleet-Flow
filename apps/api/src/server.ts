import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient, Role } from '@prisma/client';
import { AuthController } from './controllers/AuthController';
import { TripController, CreateTripSchema, CompleteTripSchema } from './controllers/TripController';
import { AnalyticsController } from './controllers/AnalyticsController';
import { VehicleController, CreateVehicleSchema, UpdateVehicleStatusSchema } from './controllers/VehicleController';
import { DriverController, CreateDriverSchema } from './controllers/DriverController';
import { MaintenanceController, CreateMaintenanceSchema, CompleteMaintenanceSchema } from './controllers/MaintenanceController';
import { FuelController, CreateFuelLogSchema } from './controllers/FuelController';
import { authenticate, authorize, AuthRequest } from './middleware/auth';
import { validateRequest } from './middleware/validateRequest';

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

// Trip Routes
app.post('/api/trips', authenticate, authorize([Role.MANAGER, Role.DISPATCHER]), validateRequest(CreateTripSchema), TripController.createTrip);
app.post('/api/trips/:id/dispatch', authenticate, authorize([Role.MANAGER, Role.DISPATCHER]), TripController.dispatchTrip);
app.post('/api/trips/:id/complete', authenticate, authorize([Role.MANAGER, Role.DISPATCHER]), validateRequest(CompleteTripSchema), TripController.completeTrip);

// Vehicle Routes
app.get('/api/vehicles', authenticate, authorize([Role.ADMIN, Role.MANAGER, Role.DISPATCHER, Role.SAFETY_OFFICER]), VehicleController.getVehicles);
app.get('/api/vehicles/:id', authenticate, authorize([Role.MANAGER, Role.DISPATCHER, Role.SAFETY_OFFICER]), VehicleController.getVehicleById);
app.post('/api/vehicles', authenticate, authorize([Role.MANAGER]), validateRequest(CreateVehicleSchema), VehicleController.createVehicle);
app.put('/api/vehicles/:id/status', authenticate, authorize([Role.MANAGER]), validateRequest(UpdateVehicleStatusSchema), VehicleController.updateStatus);

// Driver Routes
app.get('/api/drivers', authenticate, authorize([Role.ADMIN, Role.MANAGER, Role.DISPATCHER, Role.SAFETY_OFFICER]), DriverController.getDrivers);
app.get('/api/drivers/:id', authenticate, authorize([Role.MANAGER, Role.DISPATCHER, Role.SAFETY_OFFICER]), DriverController.getDriverById);
app.post('/api/drivers', authenticate, authorize([Role.MANAGER]), validateRequest(CreateDriverSchema), DriverController.createDriver);

// Maintenance Routes
app.post('/api/maintenance', authenticate, authorize([Role.MANAGER, Role.SAFETY_OFFICER]), validateRequest(CreateMaintenanceSchema), MaintenanceController.addService);
app.post('/api/maintenance/:id/complete', authenticate, authorize([Role.MANAGER, Role.SAFETY_OFFICER]), validateRequest(CompleteMaintenanceSchema), MaintenanceController.completeService);

// Fuel Routes
app.post('/api/fuel', authenticate, authorize([Role.MANAGER, Role.FINANCIAL_ANALYST]), validateRequest(CreateFuelLogSchema), FuelController.addFuelLog);

// Analytics Routes
app.get('/api/analytics/kpis', authenticate, authorize([Role.MANAGER, Role.FINANCIAL_ANALYST]), AnalyticsController.getKPIs);
app.get('/api/analytics/vehicles/:id', authenticate, authorize([Role.MANAGER, Role.FINANCIAL_ANALYST]), AnalyticsController.getVehicleMetrics);
app.get('/api/analytics/export', authenticate, authorize([Role.MANAGER, Role.FINANCIAL_ANALYST]), AnalyticsController.exportFleetReport);

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

// Error handler (must be last)
import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export { app };
