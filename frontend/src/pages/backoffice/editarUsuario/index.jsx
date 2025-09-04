import './index.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';

export default function EditarUsuario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nmUser: '',
    dsEmail: '',
    dsCpf: '',
    dsTelefone: '',
    dsSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    buscarUsuario();
  }, [id]);

  async function buscarUsuario() {
    try {
      setLoadingUser(true);
      const response = await axios.get(`http://localhost:8080/getuser/${id}`);
      const usuario = response.data;
      setFormData({
        nmUser: usuario.nmUser || '',
        dsEmail: usuario.dsEmail || '',
        dsCpf: usuario.dsCpf || '',
        dsTelefone: usuario.dsTelefone || '',
        dsSenha: ''
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      alert('Erro ao carregar dados do usuário');
      navigate('/usuarios');
    } finally {
      setLoadingUser(false);
    }
  }

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
      await axios.put(`http://localhost:8080/updateuser/${id}`, formData);
      alert('Usuário atualizado com sucesso!');
      navigate('/usuarios');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate('/usuarios');
  }

  if (loadingUser) {
    return (
      <div className="admin-layout">
        <Header nome={"Editar Usuário"}/>
        <div className="admin-content">
          <MenuLateral />
          <div className="editar-usuario-page">
            <h1>Carregando dados do usuário...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Header nome={"Editar Usuário"}/>
      <div className="admin-content">
        <MenuLateral />
        <div className="editar-usuario-page">
          <div className="form-header">
            <h1>Editar Usuário</h1>
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
                <label htmlFor="dsSenha">Nova Senha (deixe vazio para manter a atual)</label>
                <input
                  type="password"
                  id="dsSenha"
                  name="dsSenha"
                  value={formData.dsSenha}
                  onChange={handleInputChange}
                  placeholder="Digite a nova senha ou deixe vazio"
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
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
