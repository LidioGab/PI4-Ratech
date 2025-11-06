import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './CheckoutSucesso2.css';

const CheckoutSucesso = () => {
    const { pedidoId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar se temos dados do pedido passados na navegação
        if (location.state?.pedido) {
            setPedido(location.state.pedido);
            setLoading(false);
        } else if (pedidoId) {
            // Caso não tenha dados na navegação, simular busca do pedido
            // Em um ambiente real, isso faria uma requisição à API
            setTimeout(() => {
                setPedido({
                    id: pedidoId,
                    status: 'PENDENTE',
                    dataHora: new Date().toISOString()
                });
                setLoading(false);
            }, 1000);
        } else {
            navigate('/');
        }
    }, [pedidoId, location.state, navigate]);

    const handleContinuarComprando = () => {
        navigate('/');
    };

    const handleVerPedidos = () => {
        navigate('/meus-pedidos');
    };

    const formatarDataHora = (dataISO) => {
        const data = new Date(dataISO);
        return data.toLocaleString('pt-BR');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDENTE':
                return '#ffc107';
            case 'CONFIRMADO':
                return '#28a745';
            case 'ENVIADO':
                return '#007bff';
            case 'ENTREGUE':
                return '#28a745';
            case 'CANCELADO':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const getStatusTexto = (status) => {
        switch (status) {
            case 'PENDENTE':
                return 'Aguardando Confirmação';
            case 'CONFIRMADO':
                return 'Pedido Confirmado';
            case 'ENVIADO':
                return 'Pedido Enviado';
            case 'ENTREGUE':
                return 'Pedido Entregue';
            case 'CANCELADO':
                return 'Pedido Cancelado';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="checkout-loading">
                Carregando informações do pedido...
            </div>
        );
    }

    return (
        <div className="checkout-sucesso-container">
            <div className="sucesso-content">
                {/* Ícone de Sucesso */}
                <div className="sucesso-icon">
                    <div className="check-circle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4" />
                            <circle cx="12" cy="12" r="10" />
                        </svg>
                    </div>
                </div>

                {/* Título e Subtítulo */}
                <div className="sucesso-header">
                    <h1>Pedido Realizado com Sucesso!</h1>
                    <p>Seu pedido foi processado e você receberá uma confirmação por e-mail em breve.</p>
                </div>

                {/* Informações do Pedido */}
                <div className="pedido-info">
                    <div className="info-card">
                        <div className="info-row">
                            <span className="info-label">Número do Pedido:</span>
                            <span className="info-value pedido-numero">#{pedido?.id}</span>
                        </div>
                        
                        <div className="info-row">
                            <span className="info-label">Data e Hora:</span>
                            <span className="info-value">{formatarDataHora(pedido?.dataHora)}</span>
                        </div>
                        
                        <div className="info-row">
                            <span className="info-label">Status:</span>
                            <span 
                                className="info-value status-badge"
                                style={{ backgroundColor: getStatusColor(pedido?.status) }}
                            >
                                {getStatusTexto(pedido?.status)}
                            </span>
                        </div>
                        
                        {pedido?.valorTotal && (
                            <div className="info-row">
                                <span className="info-label">Valor Total:</span>
                                <span className="info-value valor-total">R$ {pedido.valorTotal.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Informações de Pagamento */}
                {location.state?.pagamento && (
                    <div className="pagamento-info-sucesso">
                        <h3>Informações de Pagamento</h3>
                        <div className="pagamento-card">
                            {location.state.pagamento === 'boleto' ? (
                                <div className="boleto-info">
                                    <p><strong>Forma de Pagamento:</strong> Boleto Bancário</p>
                                    <p><strong>Vencimento:</strong> {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</p>
                                    <p className="boleto-instrucao">
                                        O boleto foi enviado para seu e-mail. 
                                        Você também pode imprimi-lo na área de pedidos do seu perfil.
                                    </p>
                                </div>
                            ) : (
                                <div className="cartao-info">
                                    <p><strong>Forma de Pagamento:</strong> Cartão de Crédito</p>
                                    <p>O pagamento está sendo processado. Você receberá uma confirmação em breve.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Próximos Passos */}
                <div className="proximos-passos">
                    <h3>Próximos Passos</h3>
                    <div className="passos-lista">
                        <div className="passo-item">
                            <div className="passo-numero">1</div>
                            <div className="passo-texto">
                                <strong>Confirmação por E-mail</strong>
                                <p>Você receberá um e-mail com todos os detalhes do seu pedido.</p>
                            </div>
                        </div>
                        
                        <div className="passo-item">
                            <div className="passo-numero">2</div>
                            <div className="passo-texto">
                                <strong>Processamento</strong>
                                <p>Seu pedido será processado e preparado para envio.</p>
                            </div>
                        </div>
                        
                        <div className="passo-item">
                            <div className="passo-numero">3</div>
                            <div className="passo-texto">
                                <strong>Envio e Entrega</strong>
                                <p>Você receberá o código de rastreamento quando o pedido for enviado.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ações */}
                <div className="sucesso-actions">
                    <button 
                        type="button" 
                        className="btn-secundario" 
                        onClick={handleVerPedidos}
                    >
                        Ver Meus Pedidos
                    </button>
                    <button 
                        type="button" 
                        className="btn-primario" 
                        onClick={handleContinuarComprando}
                    >
                        Continuar Comprando
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSucesso;
