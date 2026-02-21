import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Map, Wrench, Fuel, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';
import './Sidebar.css';

interface NavItem {
    name: string;
    path: string;
    icon: React.ElementType;
    allowedRoles: Role[];
}

const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, allowedRoles: ['ADMIN', 'MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
    { name: 'Fleet', path: '/fleet', icon: Truck, allowedRoles: ['ADMIN', 'MANAGER', 'DISPATCHER', 'SAFETY_OFFICER'] },
    { name: 'Drivers', path: '/drivers', icon: Users, allowedRoles: ['ADMIN', 'MANAGER', 'DISPATCHER', 'SAFETY_OFFICER'] },
    { name: 'Trips', path: '/trips', icon: Map, allowedRoles: ['ADMIN', 'MANAGER', 'DISPATCHER'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, allowedRoles: ['ADMIN', 'MANAGER', 'SAFETY_OFFICER'] },
    { name: 'Fuel', path: '/fuel', icon: Fuel, allowedRoles: ['ADMIN', 'MANAGER', 'FINANCIAL_ANALYST'] },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, allowedRoles: ['ADMIN', 'MANAGER', 'FINANCIAL_ANALYST'] },
    { name: 'Settings', path: '/settings', icon: Settings, allowedRoles: ['ADMIN', 'MANAGER'] },
];

export const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    if (!user) return null;

    // Filter Navigation by specific role bound context
    const visibleNavigationItems = navItems.filter((item) =>
        item.allowedRoles.includes(user.role)
    );

    return (
        <aside className="sidebar select-none">
            <div className="sidebar-brand">
                <Truck className="brand-logo" size={32} />
                <h1 className="brand-text">Fleet Flow</h1>
            </div>

            <nav className="sidebar-nav">
                <p className="nav-header">Main Menu</p>
                <div className="nav-items-container">
                    {visibleNavigationItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }: { isActive: boolean }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <IconComponent className="nav-icon" size={20} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            <div className="sidebar-footer glass-panel">
                <div className="user-info">
                    <div className="user-avatar">
                        {user.name.charAt(0)}
                    </div>
                    <div className="user-details">
                        <p className="user-name">{user.name}</p>
                        <p className="user-role">{user.role}</p>
                    </div>
                </div>
                <button className="logout-button" onClick={logout}>
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};
