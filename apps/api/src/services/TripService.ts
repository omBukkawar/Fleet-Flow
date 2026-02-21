import { TripStatus, VehicleStatus, DriverStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, StateTransitionError, ValidationError } from '../errors/DomainError';
import { VehicleService } from './VehicleService';
import { DriverService } from './DriverService';

export class TripService {
    private static readonly ALLOWED_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
        [TripStatus.DRAFT]: [TripStatus.DISPATCHED, TripStatus.CANCELLED],
        [TripStatus.DISPATCHED]: [TripStatus.ON_TRIP, TripStatus.COMPLETED, TripStatus.CANCELLED],
        [TripStatus.ON_TRIP]: [TripStatus.COMPLETED, TripStatus.CANCELLED],
        [TripStatus.COMPLETED]: [], // Terminal
        [TripStatus.CANCELLED]: [], // Terminal
    };

    public static canTransition(current: TripStatus, target: TripStatus): boolean {
        if (current === target) return true;
        return this.ALLOWED_TRANSITIONS[current]?.includes(target);
    }

    public static async createTrip(data: { vehicleId: string, driverId: string, cargoWeight: number, origin: string, destination: string }) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
            const driver = await tx.driver.findUnique({ where: { id: data.driverId } });

            if (!vehicle) throw new NotFoundError('Vehicle not found');
            if (!driver) throw new NotFoundError('Driver not found');
            if (data.cargoWeight > vehicle.maxCapacity) {
                throw new ValidationError(`Cargo weight ${data.cargoWeight} exceeds vehicle capacity ${vehicle.maxCapacity}`);
            }

            return tx.trip.create({
                data: {
                    ...data,
                    status: TripStatus.DRAFT,
                }
            });
        });
    }

    public static async dispatchTrip(tripId: string) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const trip = await tx.trip.findUnique({
                where: { id: tripId },
                include: { vehicle: true, driver: true }
            });

            if (!trip) throw new NotFoundError('Trip not found');
            if (!this.canTransition(trip.status, TripStatus.DISPATCHED)) {
                throw new StateTransitionError('Trip', trip.status, TripStatus.DISPATCHED);
            }

            if (trip.vehicle.status !== VehicleStatus.AVAILABLE) {
                throw new ValidationError(`Vehicle ${trip.vehicleId} is not AVAILABLE`);
            }
            if (trip.driver.status !== DriverStatus.ON_DUTY) {
                throw new ValidationError(`Driver ${trip.driverId} is not ON_DUTY`);
            }

            const activeTrips = await tx.trip.count({
                where: { driverId: trip.driverId, status: { in: [TripStatus.DISPATCHED, TripStatus.ON_TRIP] } }
            });
            if (activeTrips > 0) {
                throw new ValidationError(`Driver ${trip.driverId} is assigned to another active trip`);
            }

            if (trip.driver.licenseValid === false || new Date() > new Date(trip.driver.licenseExpiryDate)) {
                throw new ValidationError(`Driver ${trip.driverId} has an expired or invalid license`);
            }
            if (trip.cargoWeight > trip.vehicle.maxCapacity) {
                throw new ValidationError(`Cargo weight ${trip.cargoWeight} exceeds vehicle capacity ${trip.vehicle.maxCapacity}`);
            }

            await VehicleService.updateStatus(trip.vehicleId, VehicleStatus.ON_TRIP, tx);
            await DriverService.updateStatus(trip.driverId, DriverStatus.ON_TRIP, tx);

            return tx.trip.update({
                where: { id: tripId },
                data: { status: TripStatus.DISPATCHED, startDate: new Date() }
            });
        });
    }

    public static async completeTrip(tripId: string, distanceKm: number) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const trip = await tx.trip.findUnique({ where: { id: tripId } });
            if (!trip) throw new NotFoundError('Trip not found');

            if (!this.canTransition(trip.status, TripStatus.COMPLETED)) {
                throw new StateTransitionError('Trip', trip.status, TripStatus.COMPLETED);
            }

            await VehicleService.updateStatus(trip.vehicleId, VehicleStatus.AVAILABLE, tx);
            await DriverService.updateStatus(trip.driverId, DriverStatus.ON_DUTY, tx);

            return tx.trip.update({
                where: { id: tripId },
                data: { status: TripStatus.COMPLETED, endDate: new Date(), distanceKm }
            });
        });
    }

    public static async cancelTrip(tripId: string) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const trip = await tx.trip.findUnique({ where: { id: tripId } });
            if (!trip) throw new NotFoundError('Trip not found');

            if (!this.canTransition(trip.status, TripStatus.CANCELLED)) {
                throw new StateTransitionError('Trip', trip.status, TripStatus.CANCELLED);
            }

            if (trip.status === TripStatus.DISPATCHED || trip.status === TripStatus.ON_TRIP) {
                await VehicleService.updateStatus(trip.vehicleId, VehicleStatus.AVAILABLE, tx);
                await DriverService.updateStatus(trip.driverId, DriverStatus.ON_DUTY, tx);
            }

            return tx.trip.update({
                where: { id: tripId },
                data: { status: TripStatus.CANCELLED, endDate: new Date() }
            });
        });
    }
}
