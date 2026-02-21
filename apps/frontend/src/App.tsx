import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Fleet } from './pages/Fleet';
import { Drivers } from './pages/Drivers';
import { Trips } from './pages/Trips';
import { Maintenance } from './pages/Maintenance';
import { Fuel } from './pages/Fuel';
import { Analytics } from './pages/Analytics';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="animate-fade-in">
    <h1>{title}</h1>
    <div className="glass-panel" style={{ padding: '40px', marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
      Feature Module Pending Implementation. View Phase tracker.
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes Wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Dashboard is visible to basically everyone inside */}
              <Route path="/" element={<Dashboard />} />

              {/* Role Specifc Stubs matching Sidebar Constraints */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DISPATCHER', 'SAFETY_OFFICER']} />}>
                <Route path="/fleet" element={<Fleet />} />
                <Route path="/drivers" element={<Drivers />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DISPATCHER']} />}>
                <Route path="/trips" element={<Trips />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SAFETY_OFFICER']} />}>
                <Route path="/maintenance" element={<Maintenance />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'FINANCIAL_ANALYST']} />}>
                <Route path="/fuel" element={<Fuel />} />
                <Route path="/analytics" element={<Analytics />} />
              </Route>

              {/* Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
