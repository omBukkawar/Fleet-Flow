import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { pdfQueue } from '../services/jobs/PdfWorker';
import { redis } from '../lib/redis';

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

    public static async generatePdfReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const csvData = await AnalyticsService.generateFleetReportCSV();

            // Convert CSV to simple HTML string
            const lines = csvData.trim().split('\n');
            const headers = lines[0].split(',');
            const rows = lines.slice(1).map((l: string) => l.split(','));

            let htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        h1 { color: #333; }
                    </style>
                </head>
                <body>
                    <h1>Fleet Report PDF</h1>
                    <table>
                        <thead><tr>${headers.map((h: string) => `<th>${h}</th>`).join('')}</tr></thead>
                        <tbody>
                            ${rows.map((row: string[]) => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            const job = await pdfQueue.add('generate-pdf', { htmlContent });

            // Wait for result in Redis (polling for max 30s)
            let attempts = 0;
            let pdfBase64 = null;
            while (attempts < 30) {
                pdfBase64 = await redis.get(`pdf_result:${job.id}`);
                if (pdfBase64) break;
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            }

            if (!pdfBase64) {
                res.status(504).json({ error: 'PDF generation timed out' });
                return;
            }

            // Cleanup key
            await redis.del(`pdf_result:${job.id}`);

            const pdfBuffer = Buffer.from(pdfBase64, 'base64');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="fleet_report.pdf"');
            res.status(200).send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }

    public static async getFuelEfficiencyTimeSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const timeSeries = await AnalyticsService.getFuelEfficiencyTimeSeries();
            res.status(200).json({ message: 'Fuel efficiency timeseries retrieved', data: timeSeries });
        } catch (error) {
            next(error);
        }
    }
}
