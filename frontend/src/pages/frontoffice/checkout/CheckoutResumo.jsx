import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import './CheckoutResumo.css';

const CheckoutResumo = () => {
    const navigate = useNavigate();
    const { cart, total, clearCart } = useCart();
    const { user } = useAuth();
    
    const [endereco, setEndereco] = useState(null);
    const [pagamento, setPagamento] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processando, setProcessando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Verificar se o carrinho não está vazio
        if (!cart || cart.length === 0) {
            navigate('/checkout/endereco');
            return;
        }

        // Verificar se usuário está logado - IGUAL ao perfil cliente  
        const cliente = localStorage.getItem('clienteSession');
        if (!cliente) {
            localStorage.setItem('redirectAfterLogin', '/checkout/resumo');
            navigate('/login');
            return;
        }

        try {
            const clienteData = JSON.parse(cliente);
            if (!clienteData || !clienteData.id) {
                navigate('/login');
                return;
            }
        } catch (error) {
            console.error('Erro ao parsear sessão do cliente:', error);
            navigate('/login');
            return;
        }

        // Recuperar dados do endereço e pagamento
        const enderecoData = sessionStorage.getItem('checkoutEndereco');
        const pagamentoData = sessionStorage.getItem('checkoutPagamento');

        if (!enderecoData || !pagamentoData) {
            navigate('/checkout/endereco');
            return;
        }

        try {
            setEndereco(JSON.parse(enderecoData));
            setPagamento(JSON.parse(pagamentoData));
        } catch (err) {
            console.error('Erro ao recuperar dados do checkout:', err);
            navigate('/checkout/endereco');
        }
    }, [cart, navigate]);

    const calcularTotalFinal = () => {
        if (pagamento?.formaPagamento === 'boleto') {
            return total * 0.95; // 5% de desconto
        } else if (pagamento?.formaPagamento === 'cartao') {
            const parcelas = parseInt(pagamento.dadosCartao?.parcelas || '1');
            const juros = parcelas > 1 ? (parcelas - 1) * 0.02 : 0;
            return total * (1 + juros);
        }
        return total;
    };

    const finalizarPedido = async () => {
        if (processando) return;

        // Verificar se os termos foram aceitos
        const termosAceitos = document.getElementById('aceitar-termos')?.checked;
        if (!termosAceitos) {
            setError('Você deve aceitar os termos de uso e política de privacidade para continuar.');
            return;
        }

        setProcessando(true);
        setError('');

        try {
            // Pegar dados do cliente do localStorage - IGUAL ao perfil cliente
            const cliente = localStorage.getItem('clienteSession');
            const clienteData = JSON.parse(cliente);
            
            // Preparar dados do pedido no formato esperado pelo backend
            const pedidoData = {
                clienteId: clienteData.id,
                itens: cart.map(item => ({
                    produtoId: item.id,
                    quantidade: item.quantidade,
                    precoUnitario: typeof item.preco === 'number' ? item.preco : parseFloat(item.preco) || 0
                })),
                cepEntrega: endereco.cep,
                enderecoEntregaLogradouro: endereco.logradouro,
                enderecoEntregaNumero: endereco.numero,
                enderecoEntregaComplemento: endereco.complemento || '',
                enderecoEntregaBairro: endereco.bairro,
                enderecoEntregaCidade: endereco.cidade,
                enderecoEntregaUf: endereco.estado || endereco.uf,
                observacoes: `Pagamento: ${pagamento.formaPagamento}${pagamento.formaPagamento === 'cartao' ? ` - ${pagamento.dadosCartao.parcelas}x` : ' - 5% desconto aplicado'}`
            };

            console.log('Dados do pedido enviados:', pedidoData);

            // Criar o pedido
            const response = await api.post('/api/pedidos', pedidoData);
            
            if (response.data && response.data.id) {
                // Limpar carrinho
                await clearCart();
                
                // Limpar dados do checkout
                sessionStorage.removeItem('checkoutEndereco');
                sessionStorage.removeItem('checkoutPagamento');
                
                // Redirecionar para página de sucesso com ID do pedido
                navigate(`/checkout/sucesso/${response.data.id}`, { 
                    state: { 
                        pedido: response.data,
                        pagamento: pagamento.formaPagamento 
                    }
                });
            } else {
                throw new Error('Erro ao criar pedido');
            }
        } catch (err) {
            console.error('Erro ao finalizar pedido:', err);
            setError(
                err.response?.data?.message || 
                'Erro ao processar pedido. Tente novamente.'
            );
        } finally {
            setProcessando(false);
        }
    };

    const handleVoltar = () => {
        navigate('/checkout/pagamento');
    };

    const formatarEndereco = (endereco) => {
        return `${endereco.logradouro}, ${endereco.numero}${endereco.complemento ? `, ${endereco.complemento}` : ''} - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado} - CEP: ${endereco.cep}`;
    };

    if (loading || !endereco || !pagamento) {
        return (
            <div className="checkout-loading">
                Carregando resumo do pedido...
            </div>
        );
    }

    return (
        <div className="checkout-resumo-container">
            <div className="checkout-header">
                <h1>Finalizar Compra</h1>
                <div className="checkout-steps">
                    <div className="step">1. Endereço</div>
                    <div className="step">2. Pagamento</div>
                    <div className="step active">3. Resumo</div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="checkout-content">
                <div className="checkout-main">
                    <div className="resumo-section">
                        <h2>Resumo do Pedido</h2>

                        {/* Dados do Cliente */}
                        <div className="dados-cliente">
                            <h3>Dados do Cliente</h3>
                            <div className="cliente-info">
                                {(() => {
                                    try {
                                        const cliente = localStorage.getItem('clienteSession');
                                        const clienteData = JSON.parse(cliente);
                                        return (
                                            <>
                                                <p><strong>Nome:</strong> {clienteData.nome}</p>
                                                <p><strong>E-mail:</strong> {clienteData.email}</p>
                                                <p><strong>CPF:</strong> {clienteData.cpf}</p>
                                            </>
                                        );
                                    } catch (error) {
                                        return <p>Erro ao carregar dados do cliente</p>;
                                    }
                                })()}
                            </div>
                        </div>

                        {/* Endereço de Entrega */}
                        <div className="endereco-entrega">
                            <h3>Endereço de Entrega</h3>
                            <div className="endereco-info">
                                <p>{formatarEndereco(endereco)}</p>
                            </div>
                        </div>

                        {/* Itens do Pedido */}
                        <div className="itens-pedido">
                            <h3>Itens do Pedido</h3>
                            <div className="itens-lista">
                                {cart.map(item => (
                                    <div key={item.id} className="item-pedido">
                                        <div className="item-imagem">
                                            {item.imagem ? (
                                                <img src={item.imagem} alt={item.nome} />
                                            ) : (
                                                <div className="placeholder-imagem">Sem imagem</div>
                                            )}
                                        </div>
                                        <div className="item-detalhes">
                                            <h4>{item.nome}</h4>
                                            <p>Quantidade: {item.quantidade}</p>
                                            <p>Preço unitário: R$ {item.preco.toFixed(2)}</p>
                                        </div>
                                        <div className="item-total">
                                            <strong>R$ {(item.preco * item.quantidade).toFixed(2)}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Forma de Pagamento */}
                        <div className="forma-pagamento">
                            <h3>Forma de Pagamento</h3>
                            <div className="pagamento-info">
                                {pagamento.formaPagamento === 'boleto' ? (
                                    <div className="pagamento-boleto">
                                        <p><strong>Boleto Bancário</strong></p>
                                        <p>Desconto de 5% aplicado</p>
                                    </div>
                                ) : (
                                    <div className="pagamento-cartao">
                                        <p><strong>Cartão de Crédito</strong></p>
                                        <p>Cartão: •••• •••• •••• {pagamento.dadosCartao.numero.slice(-4)}</p>
                                        <p>Parcelas: {pagamento.dadosCartao.parcelas}x de R$ {(calcularTotalFinal() / parseInt(pagamento.dadosCartao.parcelas)).toFixed(2)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="checkout-sidebar">
                    <div className="total-pedido">
                        <h3>Total do Pedido</h3>
                        
                        <div className="valores-resumo">
                            <div className="valor-linha">
                                <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'})</span>
                                <span>R$ {total.toFixed(2)}</span>
                            </div>
                            
                            {pagamento.formaPagamento === 'boleto' && (
                                <div className="valor-linha desconto">
                                    <span>Desconto (5%)</span>
                                    <span>-R$ {(total * 0.05).toFixed(2)}</span>
                                </div>
                            )}

                            {pagamento.formaPagamento === 'cartao' && parseInt(pagamento.dadosCartao.parcelas) > 1 && (
                                <div className="valor-linha juros">
                                    <span>Juros ({parseInt(pagamento.dadosCartao.parcelas) - 1} x 2%)</span>
                                    <span>+R$ {(calcularTotalFinal() - total).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="valor-linha total-final">
                                <span><strong>Total Final</strong></span>
                                <span><strong>R$ {calcularTotalFinal().toFixed(2)}</strong></span>
                            </div>
                        </div>

                        <div className="termos-condicoes">
                            <label className="checkbox-container">
                                <input 
                                    type="checkbox" 
                                    required 
                                    id="aceitar-termos"
                                />
                                <span className="checkmark"></span>
                                Li e aceito os <a href="/termos" target="_blank">termos de uso</a> e <a href="/privacidade" target="_blank">política de privacidade</a>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="checkout-actions">
                <button 
                    type="button" 
                    className="btn-voltar" 
                    onClick={handleVoltar}
                    disabled={processando}
                >
                    Voltar
                </button>
                <button 
                    type="button" 
                    className="btn-finalizar"
                    onClick={finalizarPedido}
                    disabled={processando}
                >
                    {processando ? 'Processando...' : 'Finalizar Pedido'}
                </button>
            </div>
        </div>
    );
};

export default CheckoutResumo;
