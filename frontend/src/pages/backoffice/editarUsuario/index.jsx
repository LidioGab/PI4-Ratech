import './index.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import { validarCPF, formatarCPF } from '../../../utils/cpf';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';

export default function EditarUsuario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    grupo: 'Administrador'
  });
  const [senhaModal, setSenhaModal] = useState({ open: false, novaSenha: '', confirmacao: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    buscarUsuario();
  }, [id]);

  async function buscarUsuario() {
    try {
      setLoadingUser(true);
      const { data } = await api.get(`/api/usuarios/${id}`);
      setFormData({
        nome: data.nome || '',
        email: data.email || '',
        cpf: data.cpf || '',
        grupo: data.grupo?.nome || 'Administrador'
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
    setFormData(p => ({ ...p, [name]: value }));
  }

  function validate() {
    const errs = {};
  if (!validarCPF(formData.cpf)) errs.cpf = 'CPF inválido';
    if (!['Administrador','Estoquista'].includes(formData.grupo)) errs.grupo = 'Grupo inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
  if (!validate()) return;
  const payload = { nome: formData.nome, cpf: formData.cpf, grupo: formData.grupo };
  await api.put(`/api/usuarios/${id}`, payload);
  alert('Usuário atualizado');
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
                <label htmlFor="nome">Nome *</label>
                <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required placeholder="Digite o nome completo" />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="text" value={formData.email} disabled />
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

              <div className="form-group full-width">
                <button type="button" onClick={() => setSenhaModal({open:true, novaSenha:'', confirmacao:''})}>Alterar Senha</button>
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
          {senhaModal.open && (
            <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <div style={{background:'#fff', padding:20, borderRadius:8, minWidth:300}}>
                <h3>Alterar Senha</h3>
                <input type="password" placeholder="Nova senha" value={senhaModal.novaSenha} onChange={e=>setSenhaModal(s=>({...s,novaSenha:e.target.value}))} style={{display:'block', width:'100%', marginBottom:8}} />
                <input type="password" placeholder="Confirmar senha" value={senhaModal.confirmacao} onChange={e=>setSenhaModal(s=>({...s,confirmacao:e.target.value}))} style={{display:'block', width:'100%', marginBottom:8}} />
                <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                  <button onClick={()=>setSenhaModal({open:false, novaSenha:'', confirmacao:''})}>Cancelar</button>
                  <button onClick={async ()=>{
                    if (!senhaModal.novaSenha || senhaModal.novaSenha !== senhaModal.confirmacao){alert('Senhas não conferem'); return;}
                    try { await api.put(`/api/usuarios/${id}/senha`, { novaSenha: senhaModal.novaSenha, confirmacao: senhaModal.confirmacao }); alert('Senha alterada'); setSenhaModal({open:false,novaSenha:'',confirmacao:''}); } catch { alert('Erro ao alterar senha'); }
                  }}>Salvar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
