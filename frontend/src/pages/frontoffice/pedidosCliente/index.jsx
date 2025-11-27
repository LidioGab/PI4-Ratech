import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HeaderFrontoffice from '../../../components/headerFrontoffice';
import HeaderPesquisa from '../../../components/headerPesquisa';
import api from '../../../services/api';
import './index.css';

export default function PedidosCliente() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = "Meus Pedidos"
        if (!user) {
            navigate('/login');
            return;
        }
        carregarPedidos();
    }, [user, navigate]);

    const carregarPedidos = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/pedidos/cliente/${user.id}?page=0&size=50`);
            // O backend retorna uma Page<Pedido>, então os pedidos estão em response.data.content
            setPedidos(response.data.content || response.data);
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            setError('Erro ao carregar pedidos');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const getStatusText = (status) => {
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
    };

    const getStatusColor = (status) => {
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
    };

    const getStatusClass = (status) => {
        return 'status-badge';
    };

    if (loading) {
        return (
            <div className="pedidos-cliente-page">
                <HeaderPesquisa />
                <HeaderFrontoffice nome="Meus Pedidos" showBackButton={true} backTo="/perfil-cliente" />
                <div className="loading">Carregando pedidos...</div>
            </div>
        );
    }

    return (
        <div className="pedidos-cliente-page">
            <HeaderPesquisa />
            
            <div className="pedidos-container">
                <div className="pedidos-header">
                    <h1>Meus Pedidos</h1>
                    <p>Acompanhe o status dos seus pedidos realizados</p>
                </div>
                {error && <div className="error-message">{error}</div>}
                
                {pedidos.length === 0 ? (
                    <div className="no-pedidos">
                        <h2>Você ainda não fez nenhum pedido</h2>
                        <p>Que tal começar suas compras agora?</p>
                        <button 
                            className="btn-comprar"
                            onClick={() => navigate('/produtos-loja')}
                        >
                            Começar a Comprar
                        </button>
                    </div>
                ) : (
                    <div className="pedidos-table-container">
                        <table className="pedidos-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Data</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.map(pedido => (
                                    <tr key={pedido.id}>
                                        <td>#{pedido.numeroPedido || pedido.id}</td>
                                        <td>{formatDate(pedido.dataPedido)}</td>
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
                                            <button 
                                                className="btn-detalhes"
                                                onClick={() => navigate(`/pedidos/${pedido.id}/detalhes`)}
                                            >
                                                Ver Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
