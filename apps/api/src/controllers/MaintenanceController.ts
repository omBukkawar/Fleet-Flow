import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/MaintenanceService';
import { z } from 'zod';

export const CreateMaintenanceSchema = z.object({
    vehicleId: z.string().uuid(),
    description: z.string().min(1),
});

export const CompleteMaintenanceSchema = z.object({
    cost: z.number().min(0).optional(),
});

export class MaintenanceController {
    public static async addService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const log = await MaintenanceService.addService(req.body);
            res.status(201).json(log);
        } catch (error) {
            next(error);
        }
    }

    public static async completeService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const log = await MaintenanceService.completeService(id, req.body.cost);
            res.status(200).json(log);
        } catch (error) {
            next(error);
        }
    }
}
