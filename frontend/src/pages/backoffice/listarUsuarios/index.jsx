import './index.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';

export default function ListarUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [confirmStatus, setConfirmStatus] = useState({ open:false, id:null, atual:false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { buscarUsuarios(); }, []);

  async function buscarUsuarios() {
    try {
      setLoading(true);
  const response = await api.get('/usuarios');
  setUsuarios(response.data || []);
      console.log(response.data)
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id) {
    try {
      await api.put(`/usuarios/${id}/status`);
      setConfirmStatus({open:false,id:null,atual:false});
      buscarUsuarios();
    } catch (e) {
      alert('Falha ao alterar status');
    }
  }

  function openStatusModal(u){
    setConfirmStatus({open:true, id:u.id, atual:u.status});
  }

  async function alterarSenha(id) {
    const novaSenha = prompt('Nova senha:');
    if (!novaSenha) return;
    const confirmacao = prompt('Confirme a nova senha:');
    if (novaSenha !== confirmacao) { alert('Senhas não conferem'); return; }
    try {
      await api.put(`/usuarios/${id}/senha`, { novaSenha, confirmacao });
      alert('Senha alterada');
    } catch (e) { alert('Erro ao alterar senha'); }
  }

  function editarUsuario(id) {
    navigate(`/editar-usuario/${id}`);
  }

  function criarUsuario() {
    navigate('/criar-usuario');
  }

  if (loading) {
    return (
      <div className="usuarios-page">
        <h1>Carregando usuários...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="usuarios-page">
        <h1>Lista de Usuários</h1>
        <div className="error-message">{error}</div>
        <button onClick={buscarUsuarios} className="retry-btn">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="admin-layout">
        <MenuLateral />
        <div className="admin-content">
        <Header nome={"Cadastro e edição de usuarios"}/>
          <div className="usuarios-page">
            <div className="usuarios-header">
              <h1>Lista de Usuários</h1>
              <div className="header-actions">
                <button onClick={criarUsuario} className="create-btn">
                  + Criar Usuário
                </button>
                <button onClick={buscarUsuarios} className="refresh-btn">
                  Atualizar
                </button>
              </div>
            </div>

            <div className="usuarios-table-container">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF</th>
                <th>Status</th>
                <th>Grupo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>{u.cpf}</td>
                    <td>{u.status ? 'Ativo' : 'Inativo'}</td>
                    <td>{u.grupo?.nome}</td>
                    <td>
                      <div className="action-buttons" style={{display:'flex', gap:'4px', flexWrap:'wrap'}}>
                        <button className="edit-btn" onClick={() => editarUsuario(u.id)}>Editar</button>
                        <button className="delete-btn" onClick={() => openStatusModal(u)}>
                          {u.status ? 'Desativar' : 'Ativar'}
                        </button>
                        <button className="edit-btn" onClick={() => alterarSenha(u.id)}>Senha</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          </div>
        </div>
      </div>
      {confirmStatus.open && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:3000}}>
          <div style={{background:'#fff', padding:24, borderRadius:12, width:360, boxShadow:'0 8px 32px rgba(0,0,0,.18)'}}>
            <h3 style={{marginTop:0}}>Confirmar alteração de status</h3>
            <p style={{marginBottom:24}}>Deseja realmente {confirmStatus.atual? 'desativar':'ativar'} este usuário?</p>
            <div style={{display:'flex', justifyContent:'flex-end', gap:12}}>
              <button className="retry-btn" type="button" onClick={()=>setConfirmStatus({open:false,id:null,atual:false})}>Cancelar</button>
              <button className={confirmStatus.atual? 'inactive-btn':'active-btn'} type="button" onClick={()=>toggleStatus(confirmStatus.id)}>
                {confirmStatus.atual? 'Desativar':'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
