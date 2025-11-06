import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { hashPasswordClientSide } from '../utils/security.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão de admin/usuário
    const stored = localStorage.getItem('sessionUser');
    if (stored) {
      try { 
        setUser(JSON.parse(stored)); 
        setLoading(false);
        return;
      } catch {}
    }
    
    // Verificar sessão de cliente
    const clienteSession = localStorage.getItem('clienteSession');
    if (clienteSession) {
      try { 
        setUser(JSON.parse(clienteSession)); 
        setLoading(false);
        return;
      } catch {}
    }
    
    setLoading(false);
  }, []);

  async function login(email, senha) {
    const senhaHash = await hashPasswordClientSide(senha);
    const body = { email, senha, senhaHash };
    const { data } = await api.post('/api/login', body);
    setUser(data);
    localStorage.setItem('sessionUser', JSON.stringify(data));
    return data;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('sessionUser');
    localStorage.removeItem('clienteSession');
  }

  // Método para definir usuário externamente (usado no login de cliente)
  function setUserData(userData) {
    setUser(userData);
    
    // Notificar mudança no localStorage para o CartContext
    window.dispatchEvent(new Event('storage'));
  }

  const value = { user, login, logout, loading, isAuthenticated: !!user, setUser: setUserData };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }

// Exportar o contexto também para uso direto
export { AuthContext };
