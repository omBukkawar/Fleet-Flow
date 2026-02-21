import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';
import { Truck } from 'lucide-react';
import { authApi } from '../lib/api';
import './Login.css';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                    {error && <div className="login-error" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</div>}

                    <div className="login-footer">
                        <p>Tip: Log in with "admin@...", "manager@...", or "dispatch@..." emails to test Roles mapping.</p>
                    </div>
                </form>
            </div>
        </div>
    );
};
