import React from 'react';
import { Fuel as FuelIcon, Plus } from 'lucide-react';
import './Fleet.css';

export const Fuel: React.FC = () => {
    return (
        <div className="page-container select-none fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Fuel Tracking</h1>
                    <p className="page-subtitle">Log refueling overheads across the fleet</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Log Refill
                </button>
            </div>

            <div className="glass-panel main-data-card" style={{ padding: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FuelIcon className="text-info" /> Recent Refills</h2>
                <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>
                    Fuel metrics integration pending layout finalization...
                </p>
            </div>
        </div>
    );
};
