import './index.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';

export default function CriarUsuario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nmUser: '',
    dsEmail: '',
    dsCpf: '',
    dsTelefone: '',
    dsSenha: ''
  });
  const [loading, setLoading] = useState(false);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('http://localhost:8080/createuser', formData);
      alert('Usuário criado com sucesso!');
      navigate('/usuarios');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate('/usuarios');
  }

  return (
    <div className="admin-layout">
      <Header nome={"Criar Usuário"}/>
      <div className="admin-content">
        <MenuLateral />
        <div className="criar-usuario-page">
          <div className="form-header">
            <h1>Criar Novo Usuário</h1>
          </div>

          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nmUser">Nome *</label>
                <input
                  type="text"
                  id="nmUser"
                  name="nmUser"
                  value={formData.nmUser}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dsEmail">Email *</label>
                <input
                  type="email"
                  id="dsEmail"
                  name="dsEmail"
                  value={formData.dsEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dsCpf">CPF *</label>
                <input
                  type="text"
                  id="dsCpf"
                  name="dsCpf"
                  value={formData.dsCpf}
                  onChange={handleInputChange}
                  required
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dsTelefone">Telefone *</label>
                <input
                  type="tel"
                  id="dsTelefone"
                  name="dsTelefone"
                  value={formData.dsTelefone}
                  onChange={handleInputChange}
                  required
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="dsSenha">Senha *</label>
                <input
                  type="password"
                  id="dsSenha"
                  name="dsSenha"
                  value={formData.dsSenha}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite a senha"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleCancel}
                className="cancel-btn"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
