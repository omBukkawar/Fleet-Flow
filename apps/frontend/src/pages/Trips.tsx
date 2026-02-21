import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Route, Map as MapIcon, Plus, Info, PlayCircle, StopCircle, RefreshCw } from 'lucide-react';
import './Fleet.css';

interface Trip {
    id: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: number;
    status: 'DRAFT' | 'DISPATCHED' | 'ON_TRIP' | 'COMPLETED' | 'CANCELLED';
    origin: string;
    destination: string;
    createdAt: string;

    vehicle: { make: string; model: string; licensePlate: string };
    driver: { name: string };
}

export const Trips: React.FC = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // NOTE: A real implementation would fetch trips with Prisma joins including vehicle & driver data
    // For the UI mockup, we will map standard API responses

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            // Assuming a GET /api/trips exists or we fetch it similarly
            const { data } = await api.get('/trips').catch(() => ({ data: [] })); // mock fallback
            setTrips(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch trips. Add a GET endpoint to Trip Controller.');
        } finally {
            setLoading(false);
        }
    };

    const dispatchTrip = async (id: string) => {
        try {
            await api.post(`/trips/${id}/dispatch`);
            fetchTrips(); // reload
        } catch (e: any) {
            alert(e.response?.data?.error || 'Dispatch Failed');
        }
    };

    const renderStatus = (s: string) => {
        switch (s) {
            case 'DRAFT': return <span className="status-badge status-retired" style={{ background: '#374151', color: '#9ca3af' }}>Draft</span>;
            case 'DISPATCHED': return <span className="status-badge status-in_shop">Dispatched</span>;
            case 'ON_TRIP': return <span className="status-badge status-on_trip">In Transit</span>;
            case 'COMPLETED': return <span className="status-badge status-available">Completed</span>;
            case 'CANCELLED': return <span className="status-badge status-retired">Cancelled</span>;
            default: return null;
        }
    };

    return (
        <div className="page-container select-none fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Trip Dispatching</h1>
                    <p className="page-subtitle">Coordinate vehicle routing and driver assignments</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Create Trip
                </button>
            </div>

            <div className="glass-panel main-data-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <MapIcon className="text-primary" />
                    <h2>Active Logistics</h2>
                </div>

                {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Trip Route</th>
                                    <th>Assignment</th>
                                    <th>Cargo</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trips.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>
                                            No active trips. Click "Create Trip" to start the workflow.
                                        </td>
                                    </tr>
                                ) : (
                                    trips.map(t => (
                                        <tr key={t.id}>
                                            <td>
                                                <strong>{t.origin}</strong>
                                                <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>&rarr;</span>
                                                <strong>{t.destination}</strong>
                                            </td>
                                            <td>{t.vehicle?.licensePlate} ({t.driver?.name})</td>
                                            <td>{t.cargoWeight} kg</td>
                                            <td>{renderStatus(t.status)}</td>
                                            <td>
                                                {t.status === 'DRAFT' && <button onClick={() => dispatchTrip(t.id)} className="btn-secondary btn-sm"><PlayCircle size={14} /> Dispatch</button>}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
