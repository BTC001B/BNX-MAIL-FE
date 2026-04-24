import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('accessToken');
        const profile = localStorage.getItem('userProfile');

        if (token && profile) {
            setIsAuthenticated(true);
            setUser(JSON.parse(profile));
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        const { accessToken, refreshToken, mailboxes, ...profile } = data;
        
        // Find primary email for UI consistency
        const primaryMailbox = mailboxes?.find(m => m.isPrimary) || mailboxes?.[0];
        const userEmail = primaryMailbox?.email || '';

        const fullProfile = { 
            ...profile, 
            email: userEmail, 
            mailboxes 
        };
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userProfile', JSON.stringify(fullProfile));
        
        setIsAuthenticated(true);
        setUser(fullProfile);
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await authAPI.logout(refreshToken);
            }
        } catch (error) {
            console.error('Backend logout failed:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userProfile');
            localStorage.removeItem('tempToken');
            
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            loading, 
            login, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};