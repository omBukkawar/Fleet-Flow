import { Request, Response, NextFunction } from 'express';
import { FuelService } from '../services/FuelService';
import { z } from 'zod';

export const CreateFuelLogSchema = z.object({
    vehicleId: z.string().uuid(),
    gallons: z.number().positive(),
    cost: z.number().positive(),
    odometer: z.number().positive().optional(),
    location: z.string().optional(),
});

export class FuelController {
    public static async addFuelLog(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const log = await FuelService.addFuelLog(req.body);
            res.status(201).json(log);
        } catch (error) {
            next(error);
        }
    }
}
