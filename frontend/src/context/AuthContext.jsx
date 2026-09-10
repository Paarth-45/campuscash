import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campuscash_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campuscash_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('campuscash_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data) {
      const authData = res.data;
      setToken(authData.token);
      setUser({
        id: authData.userId,
        name: authData.name,
        email: authData.email,
        currency: authData.currency,
        monthlyIncome: authData.monthlyIncome,
      });
      localStorage.setItem('campuscash_token', authData.token);
      localStorage.setItem('campuscash_user', JSON.stringify({
        id: authData.userId,
        name: authData.name,
        email: authData.email,
        currency: authData.currency,
        monthlyIncome: authData.monthlyIncome,
      }));
      return authData;
    }
  };

  const register = async (name, email, password, monthlyIncome) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      monthlyIncome: Number(monthlyIncome) || 0,
      currency: 'INR',
    });
    if (res.data) {
      const authData = res.data;
      setToken(authData.token);
      setUser({
        id: authData.userId,
        name: authData.name,
        email: authData.email,
        currency: authData.currency,
        monthlyIncome: authData.monthlyIncome,
      });
      localStorage.setItem('campuscash_token', authData.token);
      localStorage.setItem('campuscash_user', JSON.stringify({
        id: authData.userId,
        name: authData.name,
        email: authData.email,
        currency: authData.currency,
        monthlyIncome: authData.monthlyIncome,
      }));
      return authData;
    }
  };

  const loginAsDemo = async () => {
    return login('student@campus.edu', 'password123');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('campuscash_token');
    localStorage.removeItem('campuscash_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, register, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
