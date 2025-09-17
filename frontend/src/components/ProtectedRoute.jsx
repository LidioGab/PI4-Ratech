import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, allowedGroups }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedGroups && !allowedGroups.includes(user.grupo)) return <Navigate to="/" replace />;
  return children;
}
