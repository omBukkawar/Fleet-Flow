import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';

export class AnalyticsController {
    public static async getKPIs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const kpis = await AnalyticsService.getFleetKPIs();
            res.status(200).json({ message: 'Fleet KPIs retrieved', data: kpis });
        } catch (error) {
            next(error);
        }
    }

    public static async getVehicleMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const roi = await AnalyticsService.getVehicleROI(id);
            const costPerKm = await AnalyticsService.getVehicleCostPerKm(id);

            res.status(200).json({
                message: 'Vehicle metrics retrieved',
                data: { ...roi, costPerKm }
            });
        } catch (error) {
            next(error);
        }
    }

    public static async exportFleetReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const csvData = await AnalyticsService.generateFleetReportCSV();

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="fleet_report.csv"');
            res.status(200).send(csvData);
        } catch (error) {
            next(error);
        }
    }
}
