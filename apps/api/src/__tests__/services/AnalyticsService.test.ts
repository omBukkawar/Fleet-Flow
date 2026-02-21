import { VehicleStatus } from '@prisma/client';
import { AnalyticsService } from '../../services/AnalyticsService';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';

jest.mock('../../lib/prisma', () => ({
    prisma: {
        expense: {
            aggregate: jest.fn(),
            groupBy: jest.fn(),
        },
        maintenanceLog: {
            aggregate: jest.fn(),
            groupBy: jest.fn(),
        },
        fuelLog: {
            aggregate: jest.fn(),
            groupBy: jest.fn(),
        },
        trip: {
            aggregate: jest.fn(),
            groupBy: jest.fn(),
        },
        vehicle: {
            groupBy: jest.fn(),
            findMany: jest.fn(),
        }
    }
}));

jest.mock('../../lib/redis', () => ({
    redis: {
        get: jest.fn(),
        set: jest.fn(),
        incr: jest.fn(),
        decr: jest.fn(),
        del: jest.fn(),
        ping: jest.fn()
    }
}));

describe('AnalyticsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getFleetKPIs', () => {
        it('returns zeroes safely if empty fleet', async () => {
            (redis.get as jest.Mock).mockResolvedValue(null);
            (prisma.vehicle.groupBy as jest.Mock).mockResolvedValue([]);
            (prisma.trip.aggregate as jest.Mock).mockResolvedValue({ _sum: { distanceKm: null } });
            (prisma.fuelLog.aggregate as jest.Mock).mockResolvedValue({ _sum: { gallons: null } });

            const kpis = await AnalyticsService.getFleetKPIs();
            expect(kpis.totalActiveVehicles).toBe(0);
            expect(kpis.utilizationPercent).toBe(0);
            expect(kpis.downtimePercent).toBe(0);
            expect(kpis.fuelEfficiencyKmL).toBe(0);
        });

        it('calculates proper KPI percentages using postgres fallback if redis is missing', async () => {
            (redis.get as jest.Mock).mockResolvedValue(null);
            (prisma.vehicle.groupBy as jest.Mock).mockResolvedValue([
                { status: VehicleStatus.AVAILABLE, _count: { id: 5 } },
                { status: VehicleStatus.ON_TRIP, _count: { id: 3 } }, // 3 out of 10 = 30% util
                { status: VehicleStatus.IN_SHOP, _count: { id: 2 } }, // 2 out of 10 = 20% downtime
            ]);

            (prisma.trip.aggregate as jest.Mock).mockResolvedValue({ _sum: { distanceKm: 1000 } });
            (prisma.fuelLog.aggregate as jest.Mock).mockResolvedValue({ _sum: { gallons: 50 } }); // 50 gal = ~189 L

            const kpis = await AnalyticsService.getFleetKPIs();

            expect(kpis.totalActiveVehicles).toBe(10);
            expect(kpis.utilizationPercent).toBe(30);
            expect(kpis.downtimePercent).toBe(20);
            expect(kpis.fuelEfficiencyKmL).toBeGreaterThan(0);
            expect(kpis.fuelEfficiencyKmL).toBeLessThan(10); // 1000 / 189 = 5.28 km/L
        });

        it('uses redis values if present', async () => {
            (redis.get as jest.Mock).mockImplementation((key) => {
                if (key === 'kpi:active_vehicles') return '10';
                if (key === 'kpi:vehicles_in_shop') return '2';
                if (key === 'kpi:vehicles_on_trip') return '5';
                return null;
            });

            (prisma.trip.aggregate as jest.Mock).mockResolvedValue({ _sum: { distanceKm: 1000 } });
            (prisma.fuelLog.aggregate as jest.Mock).mockResolvedValue({ _sum: { gallons: 50 } });

            const kpis = await AnalyticsService.getFleetKPIs();

            expect(kpis.totalActiveVehicles).toBe(10);
            expect(kpis.downtimePercent).toBe(20); // 2/10
            expect(kpis.utilizationPercent).toBe(50); // 5/10
        });
    });

    describe('generateFleetReportCSV', () => {
        it('generates a CSV header and correctly mapped data using O(1) resolution', async () => {
            (prisma.vehicle.findMany as jest.Mock).mockResolvedValue([
                { id: 'v1', licensePlate: 'ABC', make: 'Ford', model: 'F150', status: VehicleStatus.AVAILABLE },
                { id: 'v2', licensePlate: 'XYZ', make: 'Chevy', model: 'Silverado', status: VehicleStatus.IN_SHOP },
            ]);

            (prisma.expense.groupBy as jest.Mock).mockResolvedValue([{ vehicleId: 'v1', _sum: { amount: 100 } }]);
            (prisma.maintenanceLog.groupBy as jest.Mock).mockResolvedValue([{ vehicleId: 'v1', _sum: { cost: 50 } }]);
            (prisma.fuelLog.groupBy as jest.Mock).mockResolvedValue([{ vehicleId: 'v2', _sum: { cost: 200 } }]);
            (prisma.trip.groupBy as jest.Mock).mockResolvedValue([
                { vehicleId: 'v1', _sum: { distanceKm: 500 } }, // Cost: 150. Rev: 1250
                { vehicleId: 'v2', _sum: { distanceKm: 1000 } } // Cost: 200. Rev: 2500
            ]);

            const csv = await AnalyticsService.generateFleetReportCSV();

            expect(csv).toContain('Vehicle ID,License Plate,Make,Model,Status,Total Cost,Total KM,Cost Per KM,Net Profit,ROI %');

            // v1 asserts
            expect(csv).toContain('v1,ABC,Ford,F150,AVAILABLE,150.00,500.00,0.30,1100.00,733.33');
            // v2 asserts
            expect(csv).toContain('v2,XYZ,Chevy,Silverado,IN_SHOP,200.00,1000.00,0.20,2300.00,1150.00');
        });
    });
});
