import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Truck, Plus, CheckCircle2, AlertTriangle, XCircle, Search, PlayCircle } from 'lucide-react';
import './Fleet.css';

interface Vehicle {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
    year: number;
    maxCapacity: number;
    status: 'AVAILABLE' | 'IN_SHOP' | 'RETIRED' | 'ON_TRIP';
}

export const Fleet: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const { data } = await api.get('/vehicles');
            setVehicles(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch fleet data.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: Vehicle['status']) => {
        switch (status) {
            case 'AVAILABLE': return <CheckCircle2 className="text-success" size={18} />;
            case 'IN_SHOP': return <AlertTriangle className="text-warning" size={18} />;
            case 'RETIRED': return <XCircle className="text-danger" size={18} />;
            case 'ON_TRIP': return <PlayCircle className="text-info" size={18} />;
            default: return null;
        }
    };

    const getStatusBadge = (status: Vehicle['status']) => {
        const defaultClass = 'status-badge';
        return <span className={`${defaultClass} status-${status.toLowerCase()}`}>{status.replace('_', ' ')}</span>;
    };

    return (
        <div className="page-container select-none fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Fleet Management</h1>
                    <p className="page-subtitle">Manage and track your vehicles</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Vehicle
                </button>
            </div>

            <div className="metrics-grid">
                <div className="metric-card glass-panel">
                    <div className="metric-icon"><Truck size={24} /></div>
                    <div>
                        <h3>Total Vehicles</h3>
                        <p className="metric-val">{vehicles.length}</p>
                    </div>
                </div>
                <div className="metric-card glass-panel">
                    <div className="metric-icon" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}><CheckCircle2 size={24} /></div>
                    <div>
                        <h3>Available</h3>
                        <p className="metric-val">{vehicles.filter(v => v.status === 'AVAILABLE').length}</p>
                    </div>
                </div>
                <div className="metric-card glass-panel">
                    <div className="metric-icon" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#eab308' }}><AlertTriangle size={24} /></div>
                    <div>
                        <h3>In Shop</h3>
                        <p className="metric-val">{vehicles.filter(v => v.status === 'IN_SHOP').length}</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel main-data-card">
                <div className="table-header">
                    <h2>Active Fleet Roster</h2>
                    <div className="search-bar">
                        <Search size={18} color="var(--text-secondary)" />
                        <input type="text" placeholder="Search license plate or model..." />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading fleet data...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--danger-color)' }}>{error}</div>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Vehicle Info</th>
                                    <th>License Plate</th>
                                    <th>Capacity</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No vehicles found.</td>
                                    </tr>
                                ) : (
                                    vehicles.map(v => (
                                        <tr key={v.id}>
                                            <td>
                                                <div className="vehicle-info-cell">
                                                    <div className="vehicle-avatar">
                                                        <Truck size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{v.make} {v.model}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Year: {v.year}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="plate-badge">{v.licensePlate}</span></td>
                                            <td>{v.maxCapacity.toLocaleString()} kg</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {getStatusIcon(v.status)}
                                                    {getStatusBadge(v.status)}
                                                </div>
                                            </td>
                                            <td>
                                                <button className="btn-secondary btn-sm">View Details</button>
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
