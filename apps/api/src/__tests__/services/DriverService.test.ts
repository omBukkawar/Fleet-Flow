import { DriverStatus } from '@prisma/client';
import { DriverService } from '../../services/DriverService';
import { prisma } from '../../lib/prisma';
import { StateTransitionError } from '../../errors/DomainError';

// Mock Prisma
jest.mock('../../lib/prisma', () => ({
    prisma: {
        driver: {
            findUnique: jest.fn(),
            update: jest.fn(),
        }
    }
}));

describe('DriverService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('allows transition from ON_DUTY to ON_TRIP', async () => {
        (prisma.driver.findUnique as jest.Mock).mockResolvedValue({ id: 'd1', status: DriverStatus.ON_DUTY });
        (prisma.driver.update as jest.Mock).mockResolvedValue({ id: 'd1', status: DriverStatus.ON_TRIP });

        await expect(DriverService.updateStatus('d1', DriverStatus.ON_TRIP)).resolves.toBeDefined();
    });

    it('allows transition from ANY to SUSPENDED unconditionally', async () => {
        (prisma.driver.findUnique as jest.Mock).mockResolvedValue({ id: 'd2', status: DriverStatus.ON_TRIP });
        (prisma.driver.update as jest.Mock).mockResolvedValue({ id: 'd2', status: DriverStatus.SUSPENDED });

        await expect(DriverService.updateStatus('d2', DriverStatus.SUSPENDED)).resolves.not.toThrow();
    });

    it('throws StateTransitionError on invalid transition', async () => {
        // You cannot go from OFF_DUTY straight to ON_TRIP
        (prisma.driver.findUnique as jest.Mock).mockResolvedValue({ id: 'd3', status: DriverStatus.OFF_DUTY });
        await expect(DriverService.updateStatus('d3', DriverStatus.ON_TRIP)).rejects.toThrow(StateTransitionError);
    });
});
