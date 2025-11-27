import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminProtectedRoute({ children, allowedGroups = ['Administrador', 'Estoquista'] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '18px' 
      }}>
        Carregando...
      </div>
    );
  }

  // Se não há usuário logado, redirecionar para login admin
  if (!user) {
    return <Navigate to="/login-adm" replace state={{ from: location }} />;
  }

  // Se é cliente, redirecionar para login admin (cliente não deve acessar área administrativa)
  if (user.grupo === 'Cliente') {
    return <Navigate to="/login-adm" replace state={{ from: location }} />;
  }

  // Verificar se o usuário tem permissão (Administrador ou Estoquista)
  if (!allowedGroups.includes(user.grupo)) {
    // Se é outro tipo de usuário sem permissão
    return (
      <div style={{
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,.65)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 5000
      }}>
        <div style={{
          background: '#fff', 
          padding: 32, 
          borderRadius: 16, 
          width: 'min(440px,90%)', 
          boxShadow: '0 12px 40px -4px rgba(0,0,0,.35)',
          textAlign: 'center'
        }}>
          <h2 style={{ marginTop: 0, color: '#dc3545' }}>Acesso Negado</h2>
          <p style={{ marginTop: 0, lineHeight: 1.5 }}>
            Esta página é apenas para usuários administrativos (Administrador ou Estoquista).
          </p>
          <p style={{ fontSize: 13, color: '#555', marginTop: 12 }}>
            Seu perfil atual: <strong>{user?.grupo}</strong>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28 }}>
            <button 
              onClick={() => window.location.href = '/login-adm'} 
              style={{
                background: '#007bff', 
                color: '#fff', 
                border: 'none', 
                padding: '10px 18px', 
                borderRadius: 8, 
                cursor: 'pointer', 
                fontWeight: 600
              }}
            >
              Ir para Login Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
