import './index.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';

export default function ListarProdutos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { buscarProdutos(); }, []);

  async function buscarProdutos() {
    try {
      setLoading(true);
      const response = await api.get('/produtos');
      setProdutos(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id) {
    try {
      await api.put(`/produtos/${id}/status`);
      buscarProdutos();
    } catch (e) {
      alert('Falha ao alterar status do produto');
    }
  }

  if (loading) {
    return (
      <div className="produtos-page">
        <h1>Carregando produtos...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="produtos-page">
        <h1>Lista de Produtos</h1>
        <div className="error-message">{error}</div>
        <button onClick={buscarProdutos} className="retry-btn">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <MenuLateral />
      <div className="admin-content">
        <Header nome={"Gerenciamento de Produtos"} />
        <div className="produtos-page">
          <div className="produtos-header">
            <h1>Lista de Produtos</h1>
            <div className="header-actions">
              <button onClick={() => navigate('/criar-produto')} className="create-btn">
                + Criar Produto
              </button>
              <button onClick={buscarProdutos} className="refresh-btn">
                Atualizar
              </button>
            </div>
          </div>

          <div className="produtos-table-container">
            <table className="produtos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Quantidade</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Opções</th>
                </tr>
              </thead>
              <tbody>
                {produtos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : (
                  produtos.map((produto) => (
                    <tr key={produto.id}>
                      <td>{produto.id}</td>
                      <td>{produto.nome}</td>
                      <td>{produto.quantidade}</td>
                      <td>R$ {produto.valor?.toFixed(2)}</td>
                      <td>{produto.status ? 'Ativo' : 'Inativo'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => navigate(`/editar-produto/${produto.id}`)}
                          >
                            Editar
                          </button>
                          <button
                            className="view-btn"
                            onClick={() => navigate(`/visualizar-produto/${produto.id}`)}
                          >
                            Visualizar
                          </button>
                          <button
                            className={produto.status ? "active-btn" : "inactive-btn"}
                            onClick={() => toggleStatus(produto.id)}
                          >
                            {produto.status ? 'Ativo' : 'Inativo'}
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