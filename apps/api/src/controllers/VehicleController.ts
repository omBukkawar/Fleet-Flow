import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { VehicleStatus } from '@prisma/client';
import { z } from 'zod';
import { VehicleService } from '../services/VehicleService';

export const CreateVehicleSchema = z.object({
    licensePlate: z.string().min(1),
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int().min(1980),
    maxCapacity: z.number().positive(),
});

export const UpdateVehicleStatusSchema = z.object({
    status: z.nativeEnum(VehicleStatus),
});

export class VehicleController {
    public static async createVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const vehicle = await prisma.vehicle.create({
                data: req.body
            });
            res.status(201).json(vehicle);
        } catch (error) {
            next(error);
        }
    }

    public static async getVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { status } = req.query;
            const whereClause = status ? { status: status as VehicleStatus } : {};

            const vehicles = await prisma.vehicle.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' }
            });
            res.status(200).json(vehicles);
        } catch (error) {
            next(error);
        }
    }

    public static async getVehicleById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const vehicle = await prisma.vehicle.findUnique({ where: { id } });
            if (!vehicle) {
                res.status(404).json({ error: 'Vehicle not found' });
                return;
            }
            res.status(200).json(vehicle);
        } catch (error) {
            next(error);
        }
    }

    public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const vehicle = await VehicleService.updateStatus(id, status as VehicleStatus);
            res.status(200).json(vehicle);
        } catch (error) {
            next(error);
        }
    }
}
