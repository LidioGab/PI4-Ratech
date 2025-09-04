import './index.css';
import Header from "../../components/header/index.jsx"
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  return (
    <div className="login-page w-full">
      <Header/>
      
      <section className='form-section w-full'>
        <h1>Bem-vindo de volta!</h1>
        <p className="subtitle">Faça login para continuar</p>
        
        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="login-btn">
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
