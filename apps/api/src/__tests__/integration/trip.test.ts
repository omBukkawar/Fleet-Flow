import request from 'supertest';
import { app } from '../../server';
import { TripService } from '../../services/TripService';
import { TripStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';

jest.mock('../../services/TripService'); // Mock the service layer completely to test controller/middleware

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-123';

describe('Trip API Integration', () => {
    let dispatchToken: string;

    beforeAll(() => {
        dispatchToken = jwt.sign(
            { userId: 'u1', email: 'dispatch@fleet.com', role: 'DISPATCHER' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/trips', () => {
        it('should create a trip successfully', async () => {
            const mockTrip = { id: 't1', status: TripStatus.DRAFT, vehicleId: 'v1', driverId: 'd1', cargoWeight: 1000, origin: 'A', destination: 'B' };
            (TripService.createTrip as jest.Mock).mockResolvedValue(mockTrip);

            const res = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${dispatchToken}`)
                .send({
                    vehicleId: 'bba335d1-5eb1-482a-8742-1e9cbfa4d9b7', // proper UUID
                    driverId: 'c2eebff8-d4d1-4db3-96cb-d31e5bbba7e6',
                    cargoWeight: 1000,
                    origin: 'New York',
                    destination: 'Boston'
                });

            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockTrip);
        });

        it('should reject invalid payload via validation middleware', async () => {
            const res = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${dispatchToken}`)
                .send({
                    vehicleId: 'invalid-id',
                    cargoWeight: -100 // invalid weight
                });

            expect(res.status).toBe(400); // validation failure caught by Zod
        });
    });

    describe('POST /api/trips/:id/dispatch', () => {
        it('should dispatch trip successfully', async () => {
            const mockTrip = { id: 't1', status: TripStatus.DISPATCHED };
            (TripService.dispatchTrip as jest.Mock).mockResolvedValue(mockTrip);

            const res = await request(app)
                .post('/api/trips/t1/dispatch')
                .set('Authorization', `Bearer ${dispatchToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockTrip);
            expect(TripService.dispatchTrip).toHaveBeenCalledWith('t1');
        });

        it('should block unauthorized access', async () => {
            const res = await request(app).post('/api/trips/t1/dispatch');
            expect(res.status).toBe(401); // without token
        });
    });

    describe('POST /api/trips/:id/complete', () => {
        it('should complete trip and apply odometer successfully', async () => {
            const mockTrip = { id: 't1', status: TripStatus.COMPLETED, distanceKm: 200 };
            (TripService.completeTrip as jest.Mock).mockResolvedValue(mockTrip);

            const res = await request(app)
                .post('/api/trips/t1/complete')
                .set('Authorization', `Bearer ${dispatchToken}`)
                .send({ distanceKm: 200 });

            expect(res.status).toBe(200);
            expect(res.body.distanceKm).toBe(200);
            expect(TripService.completeTrip).toHaveBeenCalledWith('t1', 200);
        });
    });
});
