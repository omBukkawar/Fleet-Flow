import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';
import { TripService } from '../../services/TripService';
import { prisma } from '../../lib/prisma';
import { StateTransitionError, ValidationError } from '../../errors/DomainError';

jest.mock('../../lib/prisma', () => ({
    prisma: {
        $transaction: jest.fn(async (cb) => cb(require('../../lib/prisma').prisma)),
        trip: {
            findUnique: jest.fn(),
            update: jest.fn(),
            count: jest.fn().mockResolvedValue(0),
        },
        vehicle: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        driver: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    }
}));

describe('TripService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const validDriver = {
        id: 'd1',
        status: DriverStatus.ON_DUTY,
        licenseValid: true,
        licenseExpiryDate: new Date('2030-01-01')
    };

    const validVehicle = {
        id: 'v1',
        status: VehicleStatus.AVAILABLE,
        maxCapacity: 5000
    };

    it('fails to dispatch if vehicle is NOT AVAILABLE', async () => {
        // Arrange
        (prisma.trip.findUnique as jest.Mock).mockResolvedValue({
            id: 't1',
            status: TripStatus.DRAFT,
            cargoWeight: 1000,
            vehicleId: 'v1',
            driverId: 'd1',
            vehicle: { ...validVehicle, status: VehicleStatus.IN_SHOP },
            driver: { ...validDriver }
        });

        // Act & Assert
        await expect(TripService.dispatchTrip('t1'))
            .rejects.toThrow(ValidationError);
    });

    it('fails to dispatch if cargo exceeds max capacity', async () => {
        (prisma.trip.findUnique as jest.Mock).mockResolvedValue({
            id: 't2',
            status: TripStatus.DRAFT,
            cargoWeight: 6000, // exceeds 5000
            vehicleId: 'v1',
            driverId: 'd1',
            vehicle: { ...validVehicle },
            driver: { ...validDriver }
        });

        await expect(TripService.dispatchTrip('t2'))
            .rejects.toThrow(ValidationError);
    });

    it('succeeds dispatching trip when all constraints match', async () => {
        (prisma.trip.findUnique as jest.Mock).mockResolvedValue({
            id: 't3',
            status: TripStatus.DRAFT,
            cargoWeight: 1000,
            vehicleId: 'v1',
            driverId: 'd1',
            vehicle: { ...validVehicle },
            driver: { ...validDriver }
        });

        (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(validVehicle);
        (prisma.driver.findUnique as jest.Mock).mockResolvedValue(validDriver);

        (prisma.vehicle.update as jest.Mock).mockResolvedValue({});
        (prisma.driver.update as jest.Mock).mockResolvedValue({});
        (prisma.trip.update as jest.Mock).mockResolvedValue({ id: 't3', status: TripStatus.DISPATCHED });

        const result = await TripService.dispatchTrip('t3');

        expect(result.status).toBe(TripStatus.DISPATCHED);
        expect(prisma.trip.count).toHaveBeenCalledWith(expect.anything());
        expect(prisma.vehicle.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: VehicleStatus.ON_TRIP } }));
        expect(prisma.driver.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: DriverStatus.ON_TRIP } }));
    });

    it('fails dispatch if driver has another active trip', async () => {
        (prisma.trip.findUnique as jest.Mock).mockResolvedValue({
            id: 't4', status: TripStatus.DRAFT, cargoWeight: 1000, vehicleId: 'v1', driverId: 'd1',
            vehicle: { ...validVehicle }, driver: { ...validDriver }
        });
        // mock active trips = 1
        (prisma.trip.count as jest.Mock).mockResolvedValue(1);

        await expect(TripService.dispatchTrip('t4')).rejects.toThrow(ValidationError);
    });

    it('completes trip and updates distanceKm correctly', async () => {
        (prisma.trip.findUnique as jest.Mock).mockResolvedValue({ id: 't5', status: TripStatus.DISPATCHED, vehicleId: 'v1', driverId: 'd1' });
        (prisma.trip.update as jest.Mock).mockResolvedValue({ id: 't5', status: TripStatus.COMPLETED, distanceKm: 50 });

        const result = await TripService.completeTrip('t5', 50);

        expect(result.status).toBe(TripStatus.COMPLETED);
        expect(prisma.vehicle.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: VehicleStatus.AVAILABLE } }));
        expect(prisma.driver.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: DriverStatus.ON_DUTY } }));
    });
});
