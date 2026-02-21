import { TripService } from '../../services/TripService';
import { prisma } from '../../lib/prisma';
import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';

describe('Concurrency Integration - Trip Limits', () => {

    beforeAll(async () => {
        // Clear conflicting data (ensure isolated environment)
        await prisma.trip.deleteMany();
        await prisma.vehicle.deleteMany();
        await prisma.driver.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('prevents double booking when two dispatches hit the same vehicle simultaneously', async () => {
        // Provide seed elements for standard integration check.
        const vehicle = await prisma.vehicle.create({
            data: { licensePlate: 'TEST-1234', make: 'Ford', model: 'Transit', year: 2023, maxCapacity: 2000, status: VehicleStatus.AVAILABLE }
        });

        const driver = await prisma.driver.create({
            data: { licenseNumber: 'D-1234', name: 'Bob', licenseExpiryDate: new Date('2030-01-01'), status: DriverStatus.ON_DUTY }
        });

        // 2 draft trips targeting the exact same vehicle + driver
        const trip1 = await prisma.trip.create({
            data: { vehicleId: vehicle.id, driverId: driver.id, cargoWeight: 100, origin: 'A', destination: 'B', status: TripStatus.DRAFT }
        });

        const trip2 = await prisma.trip.create({
            data: { vehicleId: vehicle.id, driverId: driver.id, cargoWeight: 200, origin: 'C', destination: 'D', status: TripStatus.DRAFT }
        });

        // We launch them perfectly perfectly simultaneously using Promise.allSettled
        const results = await Promise.allSettled([
            TripService.dispatchTrip(trip1.id),
            TripService.dispatchTrip(trip2.id),
        ]);

        // One should be fulfilled, one should be rejected. Because Prisma row level locking (`findUniqueOrThrow`/transactions)
        // or application bounds will immediately lock the vehicle into "ON_TRIP" and stop the second execution throwing an error.
        const fulfilled = results.filter(r => r.status === 'fulfilled');
        const rejected = results.filter(r => r.status === 'rejected');

        expect(fulfilled.length).toBe(1);
        expect(rejected.length).toBe(1);

        // Assert exactly 1 dispatched trip in the database
        const dispatchedTrips = await prisma.trip.findMany({ where: { status: TripStatus.DISPATCHED } });
        expect(dispatchedTrips.length).toBe(1);

        // Assert the vehicle transitioned to ON_TRIP
        const updatedVehicle = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
        expect(updatedVehicle?.status).toBe(VehicleStatus.ON_TRIP);
    });
});
