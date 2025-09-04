import './index.css';
import Header from "../../../components/header/index.jsx"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();
    try {
      const login = {
        dsEmail: email,
        dsSenha: senha
      };
      const r = await axios.post("http://localhost:8080/login", login);
      if (r.status === 200) {
        navigate('/admdashboard');
      } else {
        alert('Login inválido!');
      }
    } catch (error) {
      alert('Erro ao logar!');
      console.err(error);
    }
  }

  return (
    <div className="login-page w-full">
      <Header nome={"Faça seu login de adm"}/>
      
      <section className='form-section w-full'>
        <h1>Bem-vindo de volta!</h1>
        <p className="subtitle">Faça login para continuar</p>
        
  <form onSubmit={login}>
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

          <button className="login-btn" type="submit">
            Entrar
          </button>

          <div className="form-footer">
            <a href="#" className="forgot-password">Esqueceu sua senha?</a>
          </div>
        </form>
      </section>
    </div>
  );
}
