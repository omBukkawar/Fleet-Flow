import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';
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

    /**
     * Validates and moves a trip from DRAFT to DISPATCHED. 
     * This involves DB constraints on the dependencies.
     */
    public static async dispatchTrip(tripId: string) {
        return await prisma.$transaction(async (tx) => {
            // 1. Fetch trip and its related entities FOR UPDATE (locking)
            // Since Prisma doesn't directly support `SELECT ... FOR UPDATE` via the Prisma Client seamlessly on includes,
            // we usually fall back to raw if strict DB level locks are needed, or rely on serializable isolation.
            // Below we simulate the logic safely within the transaction.
            const trip = await tx.trip.findUnique({
                where: { id: tripId },
                include: { vehicle: true, driver: true }
            });

            if (!trip) throw new NotFoundError('Trip not found');
            if (!this.canTransition(trip.status, TripStatus.DISPATCHED)) {
                throw new StateTransitionError('Trip', trip.status, TripStatus.DISPATCHED);
            }

            // Check validations for dispatch
            if (trip.vehicle.status !== VehicleStatus.AVAILABLE) {
                throw new ValidationError(`Vehicle ${trip.vehicleId} is not AVAILABLE`);
            }
            if (trip.driver.status !== DriverStatus.ON_DUTY) {
                throw new ValidationError(`Driver ${trip.driverId} is not ON_DUTY`);
            }
            if (trip.driver.licenseValid === false || new Date() > new Date(trip.driver.licenseExpiryDate)) {
                throw new ValidationError(`Driver ${trip.driverId} has an expired or invalid license`);
            }
            if (trip.cargoWeight > trip.vehicle.maxCapacity) {
                throw new ValidationError(`Cargo weight ${trip.cargoWeight} exceeds vehicle capacity ${trip.vehicle.maxCapacity}`);
            }

            // Execute atomic updates
            await VehicleService.updateStatus(trip.vehicleId, VehicleStatus.ON_TRIP, tx);
            await DriverService.updateStatus(trip.driverId, DriverStatus.ON_TRIP, tx);

            const updatedTrip = await tx.trip.update({
                where: { id: tripId },
                data: { status: TripStatus.DISPATCHED }
            });

            return updatedTrip;
        });
    }

    /**
     * Complete a Trip.
     */
    public static async completeTrip(tripId: string) {
        return await prisma.$transaction(async (tx) => {
            const trip = await tx.trip.findUnique({ where: { id: tripId } });
            if (!trip) throw new NotFoundError('Trip not found');

            if (!this.canTransition(trip.status, TripStatus.COMPLETED)) {
                throw new StateTransitionError('Trip', trip.status, TripStatus.COMPLETED);
            }

            // Free vehicle and driver
            await VehicleService.updateStatus(trip.vehicleId, VehicleStatus.AVAILABLE, tx);
            await DriverService.updateStatus(trip.driverId, DriverStatus.ON_DUTY, tx);

            return tx.trip.update({
                where: { id: tripId },
                data: { status: TripStatus.COMPLETED, endDate: new Date() }
            });
        });
    }

    /**
     * Cancel a Trip.
     */
    public static async cancelTrip(tripId: string) {
        return await prisma.$transaction(async (tx) => {
            const trip = await tx.trip.findUnique({ where: { id: tripId } });
            if (!trip) throw new NotFoundError('Trip not found');

            if (!this.canTransition(trip.status, TripStatus.CANCELLED)) {
                throw new StateTransitionError('Trip', trip.status, TripStatus.CANCELLED);
            }

            // If it was already dispatched/on-trip, we must free the connected resources
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
