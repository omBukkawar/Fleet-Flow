import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError } from '../errors/DomainError';

export class FuelService {
    /**
     * Add a new fuel log securely, ensuring the odometer doesn't roll backwards.
     */
    public static async addFuelLog(data: { vehicleId: string; gallons: string | number; cost: number; odometer: number; location?: string }) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
            if (!vehicle) throw new NotFoundError('Vehicle not found');

            // Check for odometer rollback by finding the most recent fuel log
            const lastFuelLog = await tx.fuelLog.findFirst({
                where: { vehicleId: data.vehicleId, odometer: { not: null } },
                orderBy: { dateFilled: 'desc' }
            });

            if (lastFuelLog && lastFuelLog.odometer !== null) {
                if (data.odometer < lastFuelLog.odometer) {
                    throw new ValidationError(`Odometer rollback detected. Current log: ${data.odometer} < Previous log: ${lastFuelLog.odometer}`);
                }
            }

            const gallonsParsed = typeof data.gallons === 'string' ? parseFloat(data.gallons) : data.gallons;

            return tx.fuelLog.create({
                data: {
                    vehicleId: data.vehicleId,
                    gallons: gallonsParsed,
                    cost: data.cost,
                    odometer: data.odometer,
                    location: data.location,
                }
            });
        });
    }
}
