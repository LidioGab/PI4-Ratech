import './LoginPage.css';
import HeaderFrontoffice from "../../../components/headerFrontoffice/index.jsx";
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api.js';
import { useAuth } from '../../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    document.title = 'Faça seu login';
    const clienteSession = localStorage.getItem('clienteSession');
    if (clienteSession) {
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    }
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await api.post('/api/login', { email, senha });
      const data = response.data;

      // Verificar se é um cliente
      if (data.grupo === 'Cliente') {
        // Salvar sessão do cliente
        localStorage.setItem('clienteSession', JSON.stringify(data));
        setUser(data);
        
        // Verificar se há redirecionamento pendente
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate('/');
        }
      } else {
        // Se não for cliente, não permitir login
        setError('Esta tela de login é apenas para clientes.');
      }
    } catch (err) {
      const msg = err?.response?.data || 'Falha no login';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-cliente-page w-full">
      <HeaderFrontoffice nome="Faça seu login" showBackButton={true} />
      
      <section className='form-section w-full'>
        <h1>Bem-vindo de volta!</h1>
        <p className="subtitle">Faça login para continuar suas compras</p>
        
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
            <p className="signup-link">
              Não tem uma conta? <a href="/cadastro-cliente">Cadastre-se aqui</a>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
