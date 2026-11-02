import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('sqr_user') || localStorage.getItem('sqr_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('sqr_token') || localStorage.getItem('sqr_token') || null;
  });
  const [loading, setLoading] = useState(false);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    sessionStorage.setItem('sqr_token', newToken);
    sessionStorage.setItem('sqr_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('sqr_token');
    sessionStorage.removeItem('sqr_user');
    localStorage.removeItem('sqr_token');
    localStorage.removeItem('sqr_user');
    window.location.href = '/login';
  };

  // Helper for 1-click dev role switching for instant local testing
  const loginAsDevRole = async (roleEmail) => {
    setLoading(true);
    try {
      const res = await authApi.loginWithGoogle(`dev-${roleEmail}`);
      login(res.access_token, res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        loginAsDevRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
