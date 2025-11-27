import './index.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';
import { useAuth } from '../../../context/AuthContext.jsx';

export default function EditarPedido() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const statusOptions = [
    { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando Pagamento' },
    { value: 'PAGAMENTO_REJEITADO', label: 'Pagamento Rejeitado' },
    { value: 'PAGAMENTO_COM_SUCESSO', label: 'Pagamento com Sucesso' },
    { value: 'AGUARDANDO_RETIRADA', label: 'Aguardando Retirada' },
    { value: 'EM_TRANSITO', label: 'Em Trânsito' },
    { value: 'ENTREGUE', label: 'Entregue' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  useEffect(() => { buscarPedido(); }, [id]);

  async function buscarPedido() {
    try {
      setLoading(true);
      const response = await api.get(`/api/pedidos/${id}`);
      setPedido(response.data);
      setNovoStatus(response.data.status);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      setError('Erro ao carregar dados do pedido');
    } finally {
      setLoading(false);
    }
  }

  async function salvarStatus() {
    if (!novoStatus || novoStatus === pedido.status) return;

    try {
      setSaving(true);
      await api.put(`/api/pedidos/${id}/status`, { status: novoStatus });
      alert('Status do pedido atualizado com sucesso!');
      navigate('/listar-pedidos');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="admin-layout">
        <MenuLateral />
        <div className="admin-content">
          <Header nome={"Editar Pedido"}/>
          <div className="editar-pedido-page">
            <h1>Carregando dados do pedido...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="admin-layout">
        <MenuLateral />
        <div className="admin-content">
          <Header nome={"Editar Pedido"}/>
          <div className="editar-pedido-page">
            <div className="error-message">{error || 'Pedido não encontrado'}</div>
            <button onClick={() => navigate('/listar-pedidos')} className="back-btn">
              Voltar à lista de pedidos
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
        <Header nome={"Editar Pedido"}/>
        <div className="editar-pedido-page">
          <div className="page-header">
            <h1>Editar Status do Pedido</h1>
            <button onClick={() => navigate('/listar-pedidos')} className="back-btn">
              Voltar à lista
            </button>
          </div>

          <div className="pedido-details">
            <div className="pedido-info">
              <h2>Informações do Pedido</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Número do Pedido:</label>
                  <span>{pedido.numeroPedido}</span>
                </div>
                <div className="info-item">
                  <label>Data do Pedido:</label>
                  <span>{formatDate(pedido.dataPedido)}</span>
                </div>
                <div className="info-item">
                  <label>Cliente:</label>
                  <span>{pedido.cliente?.nome || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>E-mail do Cliente:</label>
                  <span>{pedido.cliente?.email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Valor Total:</label>
                  <span className="valor-total">{formatCurrency(pedido.valorTotal)}</span>
                </div>
                <div className="info-item">
                  <label>Status Atual:</label>
                  <span 
                    className="status-badge" 
                    style={{backgroundColor: getStatusColor(pedido.status)}}
                  >
                    {statusOptions.find(opt => opt.value === pedido.status)?.label || pedido.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="status-form">
              <h3>Alterar Status</h3>
              <div className="form-group">
                <label htmlFor="status">Novo Status:</label>
                <select 
                  id="status"
                  value={novoStatus} 
                  onChange={(e) => setNovoStatus(e.target.value)}
                  className="status-select"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button 
                  onClick={salvarStatus} 
                  disabled={saving || novoStatus === pedido.status}
                  className="save-btn"
                >
                  {saving ? 'Salvando...' : 'Salvar Status'}
                </button>
                <button 
                  onClick={() => navigate('/listar-pedidos')} 
                  className="cancel-btn"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          {pedido.itens && pedido.itens.length > 0 && (
            <div className="itens-pedido">
              <h3>Itens do Pedido</h3>
              <div className="itens-table-container">
                <table className="itens-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Preço Unitário</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.itens.map((item, index) => (
                      <tr key={index}>
                        <td>{item.produto?.nome || 'N/A'}</td>
                        <td>{item.quantidade}</td>
                        <td>{formatCurrency(item.precoUnitario)}</td>
                        <td>{formatCurrency(item.quantidade * item.precoUnitario)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
