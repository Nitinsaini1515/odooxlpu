import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('stocksense_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize user profile
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res.success) {
            setUser(res.user);
          }
        } catch (error) {
          console.warn('Session expired or invalid:', error.message);
          logout();
        }
      } else {
        // Automatically default to manager demo login for first time view
        try {
          const res = await api.auth.demoLogin('manager');
          if (res.success) {
            localStorage.setItem('stocksense_token', res.token);
            setToken(res.token);
            setUser(res.user);
          }
        } catch (e) {
          console.warn('Auto demo login skipped:', e.message);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success) {
      localStorage.setItem('stocksense_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success) {
      localStorage.setItem('stocksense_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const demoLogin = async (role = 'manager') => {
    const res = await api.auth.demoLogin(role);
    if (res.success) {
      localStorage.setItem('stocksense_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const switchRole = async (targetRole) => {
    return await demoLogin(targetRole);
  };

  const logout = () => {
    localStorage.removeItem('stocksense_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        switchRole,
        logout,
        isAuthenticated: !!token && !!user,
        isManager: user?.role === 'manager',
        isStaff: user?.role === 'staff',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
