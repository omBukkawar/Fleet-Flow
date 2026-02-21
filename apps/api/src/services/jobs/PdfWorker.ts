import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../../lib/redis';
import puppeteer from 'puppeteer';

const PDF_QUEUE_NAME = 'pdf-report-queue';

export const pdfQueue = new Queue(PDF_QUEUE_NAME, {
    connection: redis,
});

export const pdfWorker = new Worker(PDF_QUEUE_NAME, async (job: Job) => {
    console.log(`Processing PDF generation job ${job.id}`);
    const { htmlContent } = job.data;
    
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Generate PDF buffer
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        
        // In a real application, you might save this to S3 or a database.
        // For this demo, we can encode it as base64 or return a summary.
        // We will store it temporarily in redis so the client can poll for it
        if (job.id) {
           await redis.setex(`pdf_result:${job.id}`, 3600, pdfBuffer.toString('base64')); 
        }

        console.log(`Completed PDF generation job ${job.id}`);
        return { success: true };
    } catch (error) {
        console.error(`Error generating PDF for job ${job.id}:`, error);
        throw error;
    }
}, { connection: redis });

pdfWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error ${err.message}`);
});
