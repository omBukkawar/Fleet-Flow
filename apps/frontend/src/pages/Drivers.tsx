import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Users, Plus, CheckCircle2, AlertTriangle, XCircle, Search, ShieldCheck } from 'lucide-react';
import './Fleet.css'; // Reusing some base styles for consistency

interface Driver {
    id: string;
    licenseNumber: string;
    name: string;
    phone: string | null;
    licenseExpiryDate: string;
    licenseValid: boolean;
    safetyScore: number;
    status: 'ON_DUTY' | 'OFF_DUTY' | 'ON_TRIP' | 'SUSPENDED';
}

export const Drivers: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const { data } = await api.get('/drivers');
            setDrivers(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch driver data.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: Driver['status']) => {
        const statusMap = {
            'ON_DUTY': { label: 'On Duty', class: 'status-available', icon: <CheckCircle2 size={14} /> },
            'OFF_DUTY': { label: 'Off Duty', class: 'status-retired', icon: <XCircle size={14} /> },
            'ON_TRIP': { label: 'On Trip', class: 'status-on_trip', icon: <ShieldCheck size={14} /> },
            'SUSPENDED': { label: 'Suspended', class: 'status-in_shop', icon: <AlertTriangle size={14} /> }
        };

        const s = statusMap[status];

        return (
            <span className={`status-badge ${s.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {s.icon} {s.label}
            </span>
        );
    };

    const getSafetyBadge = (score: number) => {
        let color = '#22c55e'; // green
        if (score < 80) color = '#eab308'; // yellow
        if (score < 60) color = '#ef4444'; // red

        return (
            <span style={{ fontWeight: 'bold', color }}>{score} / 100</span>
        );
    };

    return (
        <div className="page-container select-none fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Driver Roster</h1>
                    <p className="page-subtitle">Manage personnel and assignments</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Driver
                </button>
            </div>

            <div className="metrics-grid">
                <div className="metric-card glass-panel">
                    <div className="metric-icon" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}><Users size={24} /></div>
                    <div>
                        <h3>Total Drivers</h3>
                        <p className="metric-val">{drivers.length}</p>
                    </div>
                </div>
                <div className="metric-card glass-panel">
                    <div className="metric-icon" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}><CheckCircle2 size={24} /></div>
                    <div>
                        <h3>On Duty</h3>
                        <p className="metric-val">{drivers.filter(d => d.status === 'ON_DUTY').length}</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel main-data-card">
                <div className="table-header">
                    <h2>Active Personnel</h2>
                    <div className="search-bar">
                        <Search size={18} color="var(--text-secondary)" />
                        <input type="text" placeholder="Search name or ID..." />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading driver data...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--danger-color)' }}>{error}</div>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Driver Name</th>
                                    <th>License ID</th>
                                    <th>License Expiry</th>
                                    <th>Safety Score</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drivers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No drivers registered.</td>
                                    </tr>
                                ) : (
                                    drivers.map(d => {
                                        const isExpired = new Date(d.licenseExpiryDate) < new Date();
                                        return (
                                            <tr key={d.id}>
                                                <td>
                                                    <div className="vehicle-info-cell">
                                                        <div className="vehicle-avatar" style={{ borderRadius: '50%', background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa' }}>
                                                            <Users size={18} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{d.name}</div>
                                                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{d.phone || 'No phone'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="plate-badge" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{d.licenseNumber}</span></td>
                                                <td>
                                                    {isExpired || !d.licenseValid ? (
                                                        <span style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <AlertTriangle size={14} /> Expired
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-primary)' }}>{new Date(d.licenseExpiryDate).toLocaleDateString()}</span>
                                                    )}
                                                </td>
                                                <td>{getSafetyBadge(d.safetyScore)}</td>
                                                <td>{getStatusBadge(d.status)}</td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
