import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Settings, Plus, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import './Fleet.css';

export const Maintenance: React.FC = () => {
    return (
        <div className="page-container select-none fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Maintenance Logs</h1>
                    <p className="page-subtitle">Track repairs and resolve vehicle errors</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Log Service
                </button>
            </div>

            <div className="glass-panel main-data-card" style={{ padding: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings className="text-warning" /> Active Service Tickets</h2>
                <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>
                    Feature integration for Maintenance endpoint pending specific UX design requirements...
                </p>
            </div>
        </div>
    );
};
