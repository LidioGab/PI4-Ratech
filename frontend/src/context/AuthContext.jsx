import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { hashPasswordClientSide } from '../utils/security.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sessionUser');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  async function login(email, senha) {
    const senhaHash = await hashPasswordClientSide(senha);
    const body = { email, senha, senhaHash };
    const { data } = await api.post('/login', body);
    setUser(data);
    localStorage.setItem('sessionUser', JSON.stringify(data));
    return data;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('sessionUser');
  }

  const value = { user, login, logout, loading, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
