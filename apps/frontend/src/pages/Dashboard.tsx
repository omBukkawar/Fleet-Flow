import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Activity, Thermometer, TrendingUp, AlertCircle } from 'lucide-react';

interface KPIs {
    totalActiveVehicles: number;
    utilizationPercent: number;
    downtimePercent: number;
    fuelEfficiencyKmL: number;
}

export const Dashboard: React.FC = () => {
    const [kpis, setKpis] = useState<KPIs | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadKPIs = async () => {
            try {
                const { data } = await api.get('/analytics/kpis').catch(() => ({
                    data: {
                        totalActiveVehicles: 0, utilizationPercent: 0, downtimePercent: 0, fuelEfficiencyKmL: 0
                    }
                }));
                setKpis(data);
            } catch (e) {
                console.error("Failed loading KPIs", e);
            } finally {
                setLoading(false);
            }
        };
        loadKPIs();
    }, []);

    return (
        <div className="animate-fade-in select-none">
            <h1 style={{ marginBottom: '8px' }}>Global Fleet Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Welcome back. Here's what's happening today in your operations.
            </p>

            {loading ? (
                <div>Loading metrics...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <p style={{ color: 'var(--text-muted)' }}><Activity size={16} style={{ display: 'inline', marginRight: '6px' }} /> Active Fleet Utilization</p>
                        <h2 style={{ fontSize: '36px', color: 'var(--primary-accent)', margin: '8px 0' }}>{kpis?.utilizationPercent}%</h2>
                        <span style={{ color: 'var(--status-success)', fontSize: '14px' }}>{kpis?.totalActiveVehicles} vehicles active</span>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <p style={{ color: 'var(--text-muted)' }}><AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} /> Fleet Downtime</p>
                        <h2 style={{ fontSize: '36px', color: 'var(--status-warning)', margin: '8px 0' }}>{kpis?.downtimePercent}%</h2>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <p style={{ color: 'var(--text-muted)' }}><TrendingUp size={16} style={{ display: 'inline', marginRight: '6px' }} /> Fuel Efficiency</p>
                        <h2 style={{ fontSize: '36px', color: 'var(--secondary-accent)', margin: '8px 0' }}>{kpis?.fuelEfficiencyKmL} <span style={{ fontSize: '16px' }}>km/L</span></h2>
                    </div>
                </div>
            )}
        </div>
    );
};
