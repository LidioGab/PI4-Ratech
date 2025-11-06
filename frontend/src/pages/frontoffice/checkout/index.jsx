import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import './index.css';

export default function Checkout() {
    const { cartItems: cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [checkoutData, setCheckoutData] = useState(null);
    const [cepEntrega, setCepEntrega] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Verificar se há itens no carrinho
        if (!cart || cart.length === 0) {
            navigate('/');
            return;
        }

        // Verificar se usuário está logado - IGUAL ao perfil cliente
        const cliente = localStorage.getItem('clienteSession');
        if (!cliente) {
            // Salvar rota atual para retornar após login
            localStorage.setItem('redirectAfterLogin', '/checkout');
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

        // Se chegou até aqui, cliente está logado - ir direto para checkout/endereco
        navigate('/checkout/endereco');
    }, [cart, navigate]);

    const validarCliente = async () => {
        // Validação simplificada - apenas verifica se o usuário tem os dados básicos
        if (!user?.nome || !user?.email) {
            setError('Dados do cliente incompletos. Faça login novamente.');
            navigate('/login');
        }
    };

    const calcularSubtotal = () => {
        return cart.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    };

    const iniciarCheckout = async () => {
        // Redirecionar para checkout multi-etapas
        navigate('/checkout/endereco');
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    if (!cart || cart.length === 0) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h1>Finalizar Pedido</h1>
                <button 
                    className="btn-voltar"
                    onClick={() => navigate('/produtos-loja')}
                >
                    ← Voltar às compras
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="checkout-content">
                <div className="checkout-left">
                    <div className="cliente-info">
                        <h2>Dados do Cliente</h2>
                        <p><strong>Nome:</strong> {user?.nome || 'Carregando...'}</p>
                        <p><strong>Email:</strong> {user?.email || 'Carregando...'}</p>
                        {!user?.nome && <p className="info-loading">Verificando dados do cliente...</p>}
                    </div>

                    <div className="entrega-info">
                        <h2>Entrega</h2>
                        <div className="form-group">
                            <label htmlFor="cep">CEP de Entrega:</label>
                            <input
                                type="text"
                                id="cep"
                                value={cepEntrega}
                                onChange={(e) => setCepEntrega(e.target.value)}
                                placeholder="00000-000"
                                maxLength="9"
                            />
                        </div>
                    </div>

                    <div className="itens-carrinho">
                        <h2>Itens do Pedido</h2>
                        {cart.map(item => (
                            <div key={item.id} className="item-checkout">
                                <div className="item-info">
                                    <h3>{item.nome}</h3>
                                    <p>Quantidade: {item.quantidade}</p>
                                    <p>Preço unitário: {formatCurrency(item.preco)}</p>
                                    <p className="subtotal-item">
                                        Subtotal: {formatCurrency(item.preco * item.quantidade)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="checkout-right">
                    <div className="resumo-pedido">
                        <h2>Resumo do Pedido</h2>
                        <div className="resumo-item">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(calcularSubtotal())}</span>
                        </div>
                        
                        {checkoutData && (
                            <>
                                <div className="resumo-item">
                                    <span>Frete:</span>
                                    <span>{formatCurrency(checkoutData.valorFrete)}</span>
                                </div>
                                <div className="resumo-item total">
                                    <span>Total:</span>
                                    <span>{formatCurrency(checkoutData.total)}</span>
                                </div>
                            </>
                        )}

                        <button
                            className="btn-finalizar"
                            onClick={iniciarCheckout}
                            disabled={loading || !cepEntrega}
                        >
                            {loading ? 'Processando...' : 'Finalizar Pedido'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
