import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HeaderFrontoffice from '../../../components/headerFrontoffice';
import api from '../../../services/api';
import './index.css';

export default function PedidosCliente() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getStatusText = (status) => {
        const statusMap = {
            'PENDENTE': 'Pendente',
            'CONFIRMADO': 'Confirmado',
            'EM_PREPARACAO': 'Em Preparação',
            'ENVIADO': 'Enviado',
            'ENTREGUE': 'Entregue',
            'CANCELADO': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        const classMap = {
            'PENDENTE': 'status-pendente',
            'CONFIRMADO': 'status-confirmado',
            'EM_PREPARACAO': 'status-preparacao',
            'ENVIADO': 'status-enviado',
            'ENTREGUE': 'status-entregue',
            'CANCELADO': 'status-cancelado'
        };
        return classMap[status] || 'status-default';
    };

    if (loading) {
        return (
            <div className="pedidos-cliente-page">
                <HeaderFrontoffice nome="Meus Pedidos" showBackButton={true} backTo="/perfil-cliente" />
                <div className="loading">Carregando pedidos...</div>
            </div>
        );
    }

    return (
        <div className="pedidos-cliente-page">
            <HeaderFrontoffice nome="Meus Pedidos" showBackButton={true} backTo="/perfil-cliente" />
            
            <div className="pedidos-container">
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
                    <div className="pedidos-list">
                        {pedidos.map(pedido => (
                            <div key={pedido.id} className="pedido-card">
                                <div className="pedido-header">
                                    <div className="pedido-info">
                                        <h3>Pedido #{pedido.id}</h3>
                                        <p className="pedido-data">
                                            Realizado em {formatDate(pedido.dataPedido)}
                                        </p>
                                    </div>
                                    <div className={`pedido-status ${getStatusClass(pedido.status)}`}>
                                        {getStatusText(pedido.status)}
                                    </div>
                                </div>
                                
                                <div className="pedido-content">
                                    <div className="pedido-itens">
                                        <h4>Itens do Pedido:</h4>
                                        {pedido.itens && pedido.itens.map(item => (
                                            <div key={item.produto.id} className="item-pedido">
                                                <div className="item-info">
                                                    <span className="item-nome">{item.produto.nome}</span>
                                                    <span className="item-quantidade">Qtd: {item.quantidade}</span>
                                                    <span className="item-preco">
                                                        {formatCurrency(item.precoUnitario)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="pedido-resumo">
                                        <div className="resumo-item">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(pedido.subtotal || 0)}</span>
                                        </div>
                                        {pedido.valorFrete && (
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
                                    <div className="pedido-endereco">
                                        <h4>Endereço de Entrega:</h4>
                                        <p>
                                            {pedido.enderecoEntrega.logradouro}, {pedido.enderecoEntrega.numero}
                                            {pedido.enderecoEntrega.complemento && `, ${pedido.enderecoEntrega.complemento}`}
                                        </p>
                                        <p>
                                            {pedido.enderecoEntrega.bairro} - {pedido.enderecoEntrega.cidade}/{pedido.enderecoEntrega.uf}
                                        </p>
                                        <p>CEP: {pedido.enderecoEntrega.cep}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}