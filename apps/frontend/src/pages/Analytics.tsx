import React from 'react';
import { BarChart3, Download } from 'lucide-react';
import './Fleet.css';

export const Analytics: React.FC = () => {
    return (
        <div className="page-container select-none fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Financial Analytics</h1>
                    <p className="page-subtitle">P&L, operational costs, and fleet insights</p>
                </div>
                <button className="btn-primary" style={{ background: '#22c55e' }}>
                    <Download size={18} style={{ marginRight: '8px' }} />
                    Export CSV Report
                </button>
            </div>

            <div className="glass-panel main-data-card" style={{ padding: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 className="text-success" /> Analytics Overview</h2>
                <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>
                    Charting and data-tables for Analytics endpoints to be finalized.
                </p>
            </div>
        </div>
    );
};
