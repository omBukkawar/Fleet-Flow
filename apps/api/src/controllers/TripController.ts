import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TripService } from '../services/TripService';
import { DomainError } from '../errors/DomainError';

export const CreateTripSchema = z.object({
    body: z.object({
        vehicleId: z.string().uuid(),
        driverId: z.string().uuid(),
        cargoWeight: z.number().positive(),
        origin: z.string().min(1),
        destination: z.string().min(1),
    }),
});

export const CompleteTripSchema = z.object({
    body: z.object({
        distanceKm: z.number().positive(),
    }),
});

export class TripController {
    public static async createTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trip = await TripService.createTrip(req.body);
            res.status(201).json(trip);
        } catch (error) {
            next(error);
        }
    }

    public static async dispatchTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const trip = await TripService.dispatchTrip(id);
            res.status(200).json(trip);
        } catch (error) {
            next(error);
        }
    }

    public static async completeTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { distanceKm } = req.body;
            const trip = await TripService.completeTrip(id, distanceKm);
            res.status(200).json(trip);
        } catch (error) {
            next(error);
        }
    }
}
