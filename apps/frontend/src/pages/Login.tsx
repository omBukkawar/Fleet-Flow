import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';
import { Truck } from 'lucide-react';
import { authApi } from '../lib/api';
import './Login.css';


import { Modal } from '../components/Modal';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('DISPATCHER');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { data } = await authApi.post('/login', { email, password });
            login(data.user, data.token);
            const origin = (location.state as any)?.from?.pathname || '/';
            navigate(origin, { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await authApi.post('/register', { email, password, role });
            setShowRegister(false);
            setEmail('');
            setPassword('');
            setRole('DISPATCHER');
            alert('Registration successful! You can now log in.');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel animate-fade-in">
                <div className="login-header">
                    <Truck className="login-logo" size={48} />
                    <h2>Welcome to Fleet Flow</h2>
                    <p>Enter your credentials to access the operational dashboard.</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="input-glass"
                            placeholder="manager@fleetflow.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input-glass"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Role</label>
                        <select className="input-glass" value={role} onChange={e => setRole(e.target.value as Role)}>
                            <option value="DISPATCHER">Dispatcher</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                    {error && <div className="login-error" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</div>}

                    <div className="login-footer">
                        <button type="button" className="btn-link" onClick={() => setShowRegister(true)}>Register</button>
                        <p>Tip: Log in with "admin@...", "manager@...", or "dispatch@..." emails to test Roles mapping.</p>
                    </div>
                </form>
            </div>

            <Modal open={showRegister} onClose={() => setShowRegister(false)}>
                <form className="login-form" onSubmit={handleRegister}>
                    <h2>Register New Account</h2>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="input-glass"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input-glass"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Role</label>
                        <select className="input-glass" value={role} onChange={e => setRole(e.target.value as Role)}>
                            <option value="DISPATCHER">Dispatcher</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                    {error && <div className="login-error" style={{ color: 'red', marginTop: '10px", textAlign: 'center' }}>{error}</div>}
                </form>
            </Modal>
        </div>
    );
};
