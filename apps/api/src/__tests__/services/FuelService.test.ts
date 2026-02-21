import { FuelService } from '../../services/FuelService';
import { prisma } from '../../lib/prisma';
import { ValidationError } from '../../errors/DomainError';

jest.mock('../../lib/prisma', () => ({
    prisma: {
        $transaction: jest.fn(async (cb) => cb(require('../../lib/prisma').prisma)),
        vehicle: {
            findUnique: jest.fn(),
        },
        fuelLog: {
            findFirst: jest.fn(),
            create: jest.fn(),
        }
    }
}));

describe('FuelService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects logging fuel if odometer decreases compared to last reading', async () => {
        (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: 'v1' });
        (prisma.fuelLog.findFirst as jest.Mock).mockResolvedValue({ odometer: 50000 }); // the previous log

        await expect(FuelService.addFuelLog({ vehicleId: 'v1', gallons: 10, cost: 40, odometer: 45000 /* lower! */ }))
            .rejects.toThrow(ValidationError);
    });

    it('allows logging fuel if odometer increases', async () => {
        (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: 'v1' });
        (prisma.fuelLog.findFirst as jest.Mock).mockResolvedValue({ odometer: 50000 }); // the previous log
        (prisma.fuelLog.create as jest.Mock).mockResolvedValue({ id: 'f1', odometer: 50100 });

        const res = await FuelService.addFuelLog({ vehicleId: 'v1', gallons: 10, cost: 40, odometer: 50100 }); // Valid

        expect(prisma.fuelLog.create).toHaveBeenCalled();
        expect(res.id).toBe('f1');
    });

    it('allows logging fuel if it is the first record ever', async () => {
        (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: 'v1' });
        (prisma.fuelLog.findFirst as jest.Mock).mockResolvedValue(null); // No logs exist yet
        (prisma.fuelLog.create as jest.Mock).mockResolvedValue({ id: 'f1', odometer: 10 });

        await expect(FuelService.addFuelLog({ vehicleId: 'v1', gallons: 10, cost: 40, odometer: 10 })).resolves.toBeDefined();
    });
});
