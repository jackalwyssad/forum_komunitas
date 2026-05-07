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
        .catch((err) => {
          // Hanya logout jika token benar-benar INVALID (401)
          // Jangan logout jika hanya network error sementara (tidak ada internet, timeout, dll)
          if (err.response?.status === 401) {
            logout();
          }
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

  // Idle timeout (Auto logout)
  useEffect(() => {
    if (!user) return; // Hanya jalankan jika user sedang login

    let idleTimer;
    const IDLE_TIMEOUT_MS = 20 * 60 * 1000; // 20 menit (sesuai config sanctum)

    const handleIdleLogout = () => {
      logout();
      alert('Sesi Anda telah berakhir karena tidak ada aktivitas (idle). Silakan login kembali.');
      window.location.href = '/login';
    };

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(handleIdleLogout, IDLE_TIMEOUT_MS);
    };

    // Event yang menandakan adanya aktivitas user
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

    const handleUserActivity = () => {
      // Optimasi: tidak setiap ms di-reset, tapi setTimeout sudah cukup ringan
      resetIdleTimer();
    };

    // Jalankan pertama kali saat komponen mount atau user berubah
    resetIdleTimer();

    // Pasang listener
    events.forEach((event) => window.addEventListener(event, handleUserActivity));

    return () => {
      clearTimeout(idleTimer);
      events.forEach((event) => window.removeEventListener(event, handleUserActivity));
    };
  }, [user]);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    const { user: u, token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const sendOtp = async (name, email, password, password_confirmation) => {
    return await api.post('/register/send-otp', { name, email, password, password_confirmation });
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/register/verify-otp', { email, otp });
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
    <AuthContext.Provider value={{ user, loading, login, sendOtp, verifyOtp, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
