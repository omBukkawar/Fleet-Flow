import { Prisma, VehicleStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError } from '../errors/DomainError';
import { VehicleService } from './VehicleService';
import { redis } from '../lib/redis';

export class MaintenanceService {
    /**
     * Add a new maintenance service log.
     * This immediately transitions the vehicle to 'IN_SHOP'.
     */
    public static async addService(data: { vehicleId: string; description: string; cost?: number; serviceDate?: Date }) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
            if (!vehicle) throw new NotFoundError('Vehicle not found');

            if (vehicle.status !== VehicleStatus.AVAILABLE) {
                throw new ValidationError(`Cannot put vehicle in shop. Current status is ${vehicle.status}`);
            }

            await VehicleService.updateStatus(vehicle.id, VehicleStatus.IN_SHOP, tx);

            // Update KPI Metric
            await redis.incr('kpi:vehicles_in_shop');

            return tx.maintenanceLog.create({
                data: {
                    vehicleId: data.vehicleId,
                    description: data.description,
                    cost: data.cost ?? 0.0,
                    serviceDate: data.serviceDate ?? new Date(),
                    isCompleted: false,
                }
            });
        });
    }

    /**
     * Complete an existing maintenance service log.
     * This immediately transitions the vehicle back to 'AVAILABLE'.
     */
    public static async completeService(logId: string, finalCost?: number) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const log = await tx.maintenanceLog.findUnique({ where: { id: logId } });
            if (!log) throw new NotFoundError('Maintenance log not found');
            if (log.isCompleted) throw new ValidationError('Service is already completed');

            const vehicle = await tx.vehicle.findUnique({ where: { id: log.vehicleId } });
            if (!vehicle) throw new NotFoundError('Vehicle not found');

            // Unblock vehicle
            await VehicleService.updateStatus(vehicle.id, VehicleStatus.AVAILABLE, tx);

            // Update KPI Metric
            await redis.decr('kpi:vehicles_in_shop');

            return tx.maintenanceLog.update({
                where: { id: logId },
                data: {
                    isCompleted: true,
                    completedDate: new Date(),
                    cost: finalCost ?? log.cost,
                }
            });
        });
    }
}
