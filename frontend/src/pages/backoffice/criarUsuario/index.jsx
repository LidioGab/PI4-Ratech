import './index.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { validarCPF, formatarCPF } from '../../../utils/cpf';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';

export default function CriarUsuario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    senha: '',
    confirmacaoSenha: '',
    grupo: 'Administrador'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  }

  function validate() {
    const errs = {};
  if (!validarCPF(formData.cpf)) errs.cpf = 'CPF inválido';
    if (formData.senha.length < 6) errs.senha = 'Senha mínima 6 caracteres';
    if (formData.senha !== formData.confirmacaoSenha) errs.confirmacaoSenha = 'Senhas não conferem';
    if (!['Administrador','Estoquista'].includes(formData.grupo)) errs.grupo = 'Grupo inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!validate()) return;
      const payload = {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        senha: formData.senha,
        confirmacaoSenha: formData.confirmacaoSenha,
        grupo: formData.grupo
      };
      await api.post('/api/usuarios', payload);
      alert('Usuário criado com sucesso');
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
                <label htmlFor="nome">Nome *</label>
                <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required placeholder="Digite o nome completo" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Digite o email" />
              </div>

              <div className="form-group">
                <label htmlFor="cpf">CPF *</label>
                <input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={e=>{
                  const { value } = e.target;
                  setFormData(p=>({...p, cpf: formatarCPF(value)}));
                }} required placeholder="000.000.000-00" />
                {errors.cpf && <span style={{color:'red'}}>{errors.cpf}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="grupo">Grupo *</label>
                <select id="grupo" name="grupo" value={formData.grupo} onChange={handleInputChange}> 
                  <option value="Administrador">Administrador</option>
                  <option value="Estoquista">Estoquista</option>
                </select>
                {errors.grupo && <span style={{color:'red'}}>{errors.grupo}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="senha">Senha *</label>
                <input type="password" id="senha" name="senha" value={formData.senha} onChange={handleInputChange} required placeholder="Digite a senha" />
                {errors.senha && <span style={{color:'red'}}>{errors.senha}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmacaoSenha">Confirmar Senha *</label>
                <input type="password" id="confirmacaoSenha" name="confirmacaoSenha" value={formData.confirmacaoSenha} onChange={handleInputChange} required placeholder="Repita a senha" />
                {errors.confirmacaoSenha && <span style={{color:'red'}}>{errors.confirmacaoSenha}</span>}
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
