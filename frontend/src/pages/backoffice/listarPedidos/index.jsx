import './index.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';
import { useAuth } from '../../../context/AuthContext.jsx';

export default function ListarPedidos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { buscarPedidos(); }, [page]);

  async function buscarPedidos() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', PAGE_SIZE);
      
      const response = await api.get(`/api/pedidos/admin/todos?${params.toString()}`);
      const data = response.data;
      
      setPedidos(data.content || []);
      setTotalPages(data.totalPages || 0);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('pt-BR');
  }

  function getStatusColor(status) {
    switch(status) {
      case 'AGUARDANDO_PAGAMENTO': return '#fbbf24';
      case 'PAGAMENTO_REJEITADO': return '#ef4444';
      case 'PAGAMENTO_COM_SUCESSO': return '#10b981';
      case 'AGUARDANDO_RETIRADA': return '#3b82f6';
      case 'EM_TRANSITO': return '#8b5cf6';
      case 'ENTREGUE': return '#059669';
      case 'CANCELADO': return '#6b7280';
      default: return '#6b7280';
    }
  }

  function getStatusText(status) {
    switch(status) {
      case 'AGUARDANDO_PAGAMENTO': return 'Aguardando Pagamento';
      case 'PAGAMENTO_REJEITADO': return 'Pagamento Rejeitado';
      case 'PAGAMENTO_COM_SUCESSO': return 'Pagamento com Sucesso';
      case 'AGUARDANDO_RETIRADA': return 'Aguardando Retirada';
      case 'EM_TRANSITO': return 'Em Trânsito';
      case 'ENTREGUE': return 'Entregue';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <MenuLateral />
        <div className="admin-content">
          <Header nome={"Gerenciar Pedidos"}/>
          <div className="pedidos-page">
            <h1>Carregando pedidos...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <MenuLateral />
        <div className="admin-content">
          <Header nome={"Gerenciar Pedidos"}/>
          <div className="pedidos-page">
            <h1>Lista de Pedidos</h1>
            <div className="error-message">{error}</div>
            <button onClick={buscarPedidos} className="retry-btn">
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <MenuLateral />
      <div className="admin-content">
        <Header nome={"Gerenciar Pedidos"}/>
        <div className="pedidos-page">
          <div className="pedidos-header">
            <h1>Lista de Pedidos</h1>
            <div className="header-actions">
              <button onClick={buscarPedidos} className="refresh-btn">
                Atualizar
              </button>
            </div>
          </div>

          <div className="pedidos-table-container">
            <table className="pedidos-table">
              <thead>
                <tr>
                  <th>Número do Pedido</th>
                  <th>Data do Pedido</th>
                  <th>Cliente</th>
                  <th>Valor Total</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      Nenhum pedido encontrado
                    </td>
                  </tr>
                ) : (
                  pedidos.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>{pedido.numeroPedido}</td>
                      <td>{formatDate(pedido.dataPedido)}</td>
                      <td>{pedido.cliente?.nome || 'N/A'}</td>
                      <td>{formatCurrency(pedido.valorTotal)}</td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{backgroundColor: getStatusColor(pedido.status), color: 'white'}}
                        >
                          {getStatusText(pedido.status)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn" 
                            onClick={() => navigate(`/editar-pedido/${pedido.id}`)}
                          >
                            Editar Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)} 
                className="pagination-btn"
              >
                Anterior
              </button>
              <span className="pagination-info">
                Página {page + 1} de {totalPages}
              </span>
              <button 
                disabled={page + 1 >= totalPages} 
                onClick={() => setPage(p => p + 1)} 
                className="pagination-btn"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
