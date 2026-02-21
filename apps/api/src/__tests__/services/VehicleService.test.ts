import { VehicleStatus } from '@prisma/client';
import { VehicleService } from '../../services/VehicleService';
import { prisma } from '../../lib/prisma';
import { StateTransitionError } from '../../errors/DomainError';

// Mock Prisma client
jest.mock('../../lib/prisma', () => ({
    prisma: {
        vehicle: {
            findUnique: jest.fn(),
            update: jest.fn(),
        }
    }
}));

describe('VehicleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('allows transition from AVAILABLE to ON_TRIP', async () => {
        (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: 'v1', status: VehicleStatus.AVAILABLE });
        (prisma.vehicle.update as jest.Mock).mockResolvedValue({ id: 'v1', status: VehicleStatus.ON_TRIP });

        const result = await VehicleService.updateStatus('v1', VehicleStatus.ON_TRIP);
        expect(result.status).toBe(VehicleStatus.ON_TRIP);
    });

    it('rejects transition from IN_SHOP to ON_TRIP directly', async () => {
        (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: 'v2', status: VehicleStatus.IN_SHOP });

        await expect(VehicleService.updateStatus('v2', VehicleStatus.ON_TRIP))
            .rejects
            .toThrow(StateTransitionError);
    });

    it('allows transition from ANY to RETIRED', async () => {
        (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: 'v3', status: VehicleStatus.IN_SHOP });
        (prisma.vehicle.update as jest.Mock).mockResolvedValue({ id: 'v3', status: VehicleStatus.RETIRED });

        const result = await VehicleService.updateStatus('v3', VehicleStatus.RETIRED);
        expect(result.status).toBe(VehicleStatus.RETIRED);
    });
});
