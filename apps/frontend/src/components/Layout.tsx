import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import './Layout.css';

export const Layout: React.FC = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <header className="top-header glass-panel">
                    <div className="header-search">
                        {/* Placeholder Global Search Bar*/}
                        <span className="search-icon">⚲</span>
                        <input type="text" placeholder="Search plates, drivers or trip IDs..." className="input-search" />
                    </div>
                </header>

                <main className="content-area animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
