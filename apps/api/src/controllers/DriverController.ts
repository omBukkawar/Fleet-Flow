import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { DriverStatus } from '@prisma/client';
import { z } from 'zod';

export const CreateDriverSchema = z.object({
    licenseNumber: z.string().min(1),
    name: z.string().min(1),
    phone: z.string().optional(),
    licenseExpiryDate: z.string().datetime(),
});

export class DriverController {
    public static async createDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = { ...req.body, licenseExpiryDate: new Date(req.body.licenseExpiryDate) };
            const driver = await prisma.driver.create({
                data
            });
            res.status(201).json(driver);
        } catch (error) {
            next(error);
        }
    }

    public static async getDrivers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { status } = req.query;
            const whereClause = status ? { status: status as DriverStatus } : {};

            const drivers = await prisma.driver.findMany({
                where: whereClause,
                orderBy: { name: 'asc' }
            });
            res.status(200).json(drivers);
        } catch (error) {
            next(error);
        }
    }

    public static async getDriverById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const driver = await prisma.driver.findUnique({ where: { id } });
            if (!driver) {
                res.status(404).json({ error: 'Driver not found' });
                return;
            }
            res.status(200).json(driver);
        } catch (error) {
            next(error);
        }
    }
}
