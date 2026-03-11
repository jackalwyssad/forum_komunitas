import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      api.get('/me')
        .then((res) => {
          const u = res.data.user;
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for profile updates from Settings page
  useEffect(() => {
    const handleUserUpdate = () => {
      const saved = localStorage.getItem('user');
      if (saved) setUser(JSON.parse(saved));
    };
    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    const { user: u, token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (name, email, password, password_confirmation) => {
    const res = await api.post('/register', { name, email, password, password_confirmation });
    const { user: u, token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
