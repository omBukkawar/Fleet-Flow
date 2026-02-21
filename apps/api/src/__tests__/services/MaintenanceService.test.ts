import { VehicleStatus, Prisma } from '@prisma/client';
import { MaintenanceService } from '../../services/MaintenanceService';
import { prisma } from '../../lib/prisma';
import { ValidationError } from '../../errors/DomainError';
import { VehicleService } from '../../services/VehicleService';

jest.mock('../../lib/prisma', () => ({
    prisma: {
        $transaction: jest.fn(async (cb) => cb(require('../../lib/prisma').prisma)),
        maintenanceLog: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        vehicle: {
            findUnique: jest.fn(),
            update: jest.fn()
        }
    }
}));

describe('MaintenanceService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(VehicleService, 'updateStatus').mockResolvedValue({} as any);
    });

    describe('addService', () => {
        it('throws Validation Error if vehicle is currently ON_TRIP', async () => {
            (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: 'v1', status: VehicleStatus.ON_TRIP });

            await expect(MaintenanceService.addService({ vehicleId: 'v1', description: 'Brakes' }))
                .rejects.toThrow(ValidationError);
        });

        it('sets vehicle to IN_SHOP and creates a maintenance log', async () => {
            (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: 'v2', status: VehicleStatus.AVAILABLE });
            (prisma.maintenanceLog.create as jest.Mock).mockResolvedValue({ id: 'm1', vehicleId: 'v2' });

            const res = await MaintenanceService.addService({ vehicleId: 'v2', description: 'Tires' });

            expect(res.id).toBe('m1');
            expect(VehicleService.updateStatus).toHaveBeenCalledWith('v2', VehicleStatus.IN_SHOP, expect.anything());
            expect(prisma.maintenanceLog.create).toHaveBeenCalled();
        });
    });

    describe('completeService', () => {
        it('throws Validation Error if already completed', async () => {
            (prisma.maintenanceLog.findUnique as jest.Mock).mockResolvedValue({ id: 'm2', vehicleId: 'v3', isCompleted: true });
            await expect(MaintenanceService.completeService('m2')).rejects.toThrow(ValidationError);
        });

        it('sets vehicle to AVAILABLE and completes log', async () => {
            (prisma.maintenanceLog.findUnique as jest.Mock).mockResolvedValue({ id: 'm3', vehicleId: 'v4', isCompleted: false, cost: 50 });
            (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: 'v4', status: VehicleStatus.IN_SHOP });
            (prisma.maintenanceLog.update as jest.Mock).mockResolvedValue({ id: 'm3', isCompleted: true });

            const res = await MaintenanceService.completeService('m3', 75); // overriding cost

            expect(res.isCompleted).toBe(true);
            expect(VehicleService.updateStatus).toHaveBeenCalledWith('v4', VehicleStatus.AVAILABLE, expect.anything());
            expect(prisma.maintenanceLog.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ cost: 75 }) }));
        });
    });
});
