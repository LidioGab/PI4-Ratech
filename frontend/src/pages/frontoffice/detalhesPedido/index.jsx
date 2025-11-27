import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderPesquisa from '../../../components/headerPesquisa/index.jsx';
import './index.css';

function DetalhesPedido() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        buscarPedido();
    }, [id]);

    const buscarPedido = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`http://localhost:8080/api/pedidos/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Pedido não encontrado');
            }

            const data = await response.json();
            setPedido(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getStatusText = (status) => {
        const statusMap = {
            'AGUARDANDO_PAGAMENTO': 'Aguardando Pagamento',
            'PAGAMENTO_REJEITADO': 'Pagamento Rejeitado',
            'PAGAMENTO_COM_SUCESSO': 'Pagamento Confirmado',
            'AGUARDANDO_RETIRADA': 'Aguardando Retirada',
            'EM_TRANSITO': 'Em Trânsito',
            'ENTREGUE': 'Entregue',
            'CANCELADO': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            'AGUARDANDO_PAGAMENTO': '#f59e0b',
            'PAGAMENTO_REJEITADO': '#ef4444',
            'PAGAMENTO_COM_SUCESSO': '#10b981',
            'AGUARDANDO_RETIRADA': '#3b82f6',
            'EM_TRANSITO': '#8b5cf6',
            'ENTREGUE': '#059669',
            'CANCELADO': '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    if (loading) {
        return (
            <div className="detalhes-pedido-page">
                <HeaderPesquisa />
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Carregando detalhes do pedido...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="detalhes-pedido-page">
                <HeaderPesquisa />
                <div className="error-container">
                    <div className="error-card">
                        <h2>Pedido não encontrado</h2>
                        <p>{error}</p>
                        <button className="btn-voltar" onClick={() => navigate('/meus-pedidos')}>
                            Voltar aos Meus Pedidos
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!pedido) {
        return null;
    }

    return (
        <div className="detalhes-pedido-page">
            <HeaderPesquisa />
            
            <div className="detalhes-container">
                <div className="detalhes-header">
                    <button className="btn-voltar" onClick={() => navigate('/meus-pedidos')}>
                        ← Voltar
                    </button>
                    <h1>Detalhes do Pedido</h1>
                </div>

                <div className="pedido-card">
                    <div className="pedido-header-info">
                        <div className="pedido-numero">
                            <h2>Pedido #{pedido.numeroPedido || pedido.id}</h2>
                            <span className="pedido-data">
                                Realizado em {formatDate(pedido.dataPedido)}
                            </span>
                        </div>
                        <div className="pedido-status">
                            <span 
                                className="status-badge-large" 
                                style={{backgroundColor: getStatusColor(pedido.status), color: 'white'}}
                            >
                                {getStatusText(pedido.status)}
                            </span>
                        </div>
                    </div>

                    <div className="pedido-content">
                        <div className="section">
                            <h3>Itens do Pedido</h3>
                            <div className="itens-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Preço Unit.</th>
                                            <th>Qtd.</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedido.itens && pedido.itens.map(item => (
                                            <tr key={item.produto.id}>
                                                <td>
                                                    <div className="produto-info">
                                                        <strong>{item.produto.nome}</strong>
                                                        {item.produto.descricao && (
                                                            <span className="produto-descricao">
                                                                {item.produto.descricao}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{formatCurrency(item.precoUnitario)}</td>
                                                <td>{item.quantidade}</td>
                                                <td>{formatCurrency(item.precoUnitario * item.quantidade)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="section">
                            <h3>Resumo do Pedido</h3>
                            <div className="resumo-financeiro">
                                <div className="resumo-item">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(pedido.subtotal || 0)}</span>
                                </div>
                                {pedido.valorFrete && pedido.valorFrete > 0 && (
                                    <div className="resumo-item">
                                        <span>Frete:</span>
                                        <span>{formatCurrency(pedido.valorFrete)}</span>
                                    </div>
                                )}
                                <div className="resumo-item total">
                                    <span>Total:</span>
                                    <span>{formatCurrency(pedido.valorTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {pedido.enderecoEntrega && (
                            <div className="section">
                                <h3>Endereço de Entrega</h3>
                                <div className="endereco-info">
                                    <p>
                                        <strong>{pedido.enderecoEntrega.logradouro}, {pedido.enderecoEntrega.numero}</strong>
                                        {pedido.enderecoEntrega.complemento && (
                                            <span>, {pedido.enderecoEntrega.complemento}</span>
                                        )}
                                    </p>
                                    <p>{pedido.enderecoEntrega.bairro}</p>
                                    <p>{pedido.enderecoEntrega.cidade} - {pedido.enderecoEntrega.uf}</p>
                                    <p>CEP: {pedido.enderecoEntrega.cep}</p>
                                </div>
                            </div>
                        )}

                        {pedido.observacoes && (
                            <div className="section">
                                <h3>Observações</h3>
                                <div className="observacoes">
                                    <p>{pedido.observacoes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetalhesPedido;
