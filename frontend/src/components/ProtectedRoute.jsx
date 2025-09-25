import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, allowedGroups }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace state={{ from: location }} />;

  const notAllowed = allowedGroups && !allowedGroups.includes(user.grupo);
  if (notAllowed) {
    return (
      <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:5000}}>
        <div style={{background:'#fff', padding:32, borderRadius:16, width:'min(440px,90%)', boxShadow:'0 12px 40px -4px rgba(0,0,0,.35)'}} role="alertdialog" aria-labelledby="denied-title" aria-modal="true">
          <h2 id="denied-title" style={{marginTop:0}}>Permissão Negada</h2>
          <p style={{marginTop:0, lineHeight:1.5}}>Seu perfil <strong>{user?.grupo}</strong> não possui acesso a esta funcionalidade.</p>
          <p style={{fontSize:13, color:'#555', marginTop:12}}>Se acredita que isso é um erro, contate um administrador.</p>
          <div style={{display:'flex', justifyContent:'flex-end', gap:12, marginTop:28}}>
            <button onClick={()=>navigate(-1)} style={{background:'#6366f1', color:'#fff', border:'none', padding:'10px 18px', borderRadius:8, cursor:'pointer', fontWeight:600}}>Voltar</button>
          </div>
        </div>
      </div>
    );
  }
  return children;
}
