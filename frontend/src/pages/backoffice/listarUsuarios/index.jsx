import './index.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';

export default function ListarUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    buscarUsuarios();
  }, []);

  async function buscarUsuarios() {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/getusers');
      setUsuarios(response.data);
      console.log(response.data)
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  async function deletarUsuario(idUser) {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await axios.delete(`http://localhost:8080/deleteuser/${idUser}`);
        alert('Usuário excluído com sucesso!');
        buscarUsuarios(); 
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário');
      }
    }
  }

  function editarUsuario(idUser) {
    navigate(`/editar-usuario/${idUser}`);
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
              <th>Telefone</th>
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
              usuarios.map((usuario) => (
                <tr key={usuario.idUser}>
                  <td>{usuario.idUser}</td>
                  <td>{usuario.nmUser}</td>
                  <td>{usuario.dsEmail}</td>
                  <td>{usuario.dsCpf}</td>
                  <td>{usuario.dsTelefone}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn" 
                        onClick={() => editarUsuario(usuario.idUser)}
                      >
                        Editar
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => deletarUsuario(usuario.idUser)}
                      >
                        Excluir
                      </button>
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
  );
}
