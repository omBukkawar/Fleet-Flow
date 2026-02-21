import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated || !user) {
        // Redirect them to the /login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Role not authorized, display generic unauthorized overlay or redirect
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                    <h2>403 - Forbidden</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>You do not have permission to view this module.</p>
                </div>
            </div>
        );
    }

    // User is authenticated and authorized
    return <Outlet />;
};
