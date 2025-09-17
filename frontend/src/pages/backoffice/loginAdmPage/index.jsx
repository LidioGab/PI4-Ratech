import './index.css';
import Header from "../../../components/header/index.jsx"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, senha);
      navigate('/admdashboard');
    } catch (err) {
      const msg = err?.response?.data || 'Falha no login';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page w-full">
      <Header nome={"Faça seu login de adm"}/>
      
      <section className='form-section w-full'>
        <h1>Bem-vindo de volta!</h1>
        <p className="subtitle">Faça login para continuar</p>
        
  <form onSubmit={handleLogin}>
          <div className='form-inputs'>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              placeholder="Digite seu email"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='form-inputs'>
            <label htmlFor="senha">Senha</label>
            <input 
              type="password" 
              id="senha"
              placeholder="Digite sua senha"
              value={senha} 
              onChange={e => setSenha(e.target.value)}
              required
            />
          </div>

          {error && <div style={{color:'red', marginBottom:'8px'}}>{error}</div>}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="form-footer">
            <a href="#" className="forgot-password">Esqueceu sua senha?</a>
          </div>
        </form>
      </section>
    </div>
  );
}
