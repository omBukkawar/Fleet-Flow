import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Shared domain roles mapped from backend expectation
export type Role = 'ADMIN' | 'MANAGER' | 'DISPATCHER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, tokenStr: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // For the sake of the initial UI Foundation mock, we can hardcode null
    // In a real scenario, this hydrates from localStorage.
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const login = (userData: User, tokenStr: string) => {
        setUser(userData);
        setToken(tokenStr);
        localStorage.setItem('fleet_token', tokenStr);
        localStorage.setItem('fleet_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('fleet_token');
        localStorage.removeItem('fleet_user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!user && !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
