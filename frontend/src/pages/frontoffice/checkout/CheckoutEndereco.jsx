import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import './CheckoutEndereco.css';

export default function CheckoutEndereco() {
    const { cartItems } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [enderecos, setEnderecos] = useState([]);
    const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Formulário novo endereço
    const [novoEndereco, setNovoEndereco] = useState({
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        estado: ''
    });

    useEffect(() => {
        // Verificar carrinho primeiro
        if (!cartItems || cartItems.length === 0) {
            navigate('/');
            return;
        }

        // Verificar se usuário está logado - IGUAL ao perfil cliente  
        const cliente = localStorage.getItem('clienteSession');
        if (!cliente) {
            localStorage.setItem('redirectAfterLogin', '/checkout/endereco');
            navigate('/login');
            return;
        }

        try {
            const clienteData = JSON.parse(cliente);
            if (!clienteData || !clienteData.id) {
                navigate('/login');
                return;
            }
            
            // Carregar endereços do cliente logado
            carregarEnderecos(clienteData.id);
        } catch (error) {
            console.error('Erro ao parsear sessão do cliente:', error);
            navigate('/login');
        }
    }, [cartItems, navigate]);

    const carregarEnderecos = async (clienteId) => {
        try {
            setLoading(true);
            const response = await api.get(`/api/clientes/${clienteId}`);
            
            const enderecos = response.data.enderecos || [];
            const enderecosEntrega = enderecos.filter(endereco => 
                endereco.tipoEndereco === 'ENTREGA'
            );
            setEnderecos(enderecosEntrega);
            
            if (enderecosEntrega.length > 0) {
                setEnderecoSelecionado(enderecosEntrega[0].id);
            }
        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
            setError(`Erro ao carregar endereços. Verifique se o servidor está rodando.`);
        } finally {
            setLoading(false);
        }
    };

    const buscarCep = async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                setNovoEndereco(prev => ({
                    ...prev,
                    logradouro: data.logradouro || '',
                    bairro: data.bairro || '',
                    cidade: data.localidade || '',
                    uf: data.uf || '',
                    estado: data.uf || ''
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    };

    const adicionarEndereco = async (e) => {
        e.preventDefault();
        
        if (!novoEndereco.cep || !novoEndereco.logradouro || !novoEndereco.numero || 
            !novoEndereco.bairro || !novoEndereco.cidade || !novoEndereco.uf) {
            setError('Todos os campos obrigatórios devem ser preenchidos');
            return;
        }

        try {
            const response = await api.post(`/api/clientes/${user.id}/enderecos`, {
                ...novoEndereco,
                estado: novoEndereco.uf,
                tipoEndereco: 'ENTREGA'
            });
            
            await carregarEnderecos();
            setEnderecoSelecionado(response.data.id);
            setMostrarFormulario(false);
            setNovoEndereco({
                cep: '',
                logradouro: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                uf: ''
            });
            setError('');
        } catch (error) {
            console.error('Erro ao adicionar endereço:', error);
            setError('Erro ao adicionar endereço');
        }
    };

    const prosseguir = () => {
        if (!enderecoSelecionado) {
            setError('Selecione um endereço de entrega');
            return;
        }
        
        // Salvar endereço selecionado na sessão
        const endereco = enderecos.find(e => e.id === enderecoSelecionado);
        sessionStorage.setItem('checkoutEndereco', JSON.stringify(endereco));
        
        navigate('/checkout/pagamento');
    };

    const calcularSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    if (loading) {
        return <div className="checkout-loading">Carregando...</div>;
    }

    return (
        <div className="checkout-endereco-container">
            <div className="checkout-header">
                <h1>Escolher Endereço de Entrega</h1>
                <div className="checkout-steps">
                    <div className="step active">1. Endereço</div>
                    <div className="step">2. Pagamento</div>
                    <div className="step">3. Resumo</div>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="checkout-content">
                <div className="checkout-main">
                    <div className="endereco-section">
                        <h2>Selecione o Endereço de Entrega</h2>
                        
                        {enderecos.length === 0 ? (
                            <div className="no-enderecos">
                                <p>Você não possui endereços de entrega cadastrados.</p>
                                <button 
                                    className="btn-adicionar-endereco"
                                    onClick={() => setMostrarFormulario(true)}
                                >
                                    Adicionar Endereço
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="enderecos-list">
                                    {enderecos.map(endereco => (
                                        <div 
                                            key={endereco.id}
                                            className={`endereco-card ${enderecoSelecionado === endereco.id ? 'selecionado' : ''}`}
                                            onClick={() => setEnderecoSelecionado(endereco.id)}
                                        >
                                            <input
                                                type="radio"
                                                name="endereco"
                                                value={endereco.id}
                                                checked={enderecoSelecionado === endereco.id}
                                                onChange={() => setEnderecoSelecionado(endereco.id)}
                                            />
                                            <div className="endereco-info">
                                                <div className="endereco-linha1">
                                                    {endereco.logradouro}, {endereco.numero}
                                                </div>
                                                {endereco.complemento && (
                                                    <div className="endereco-complemento">
                                                        {endereco.complemento}
                                                    </div>
                                                )}
                                                <div className="endereco-linha2">
                                                    {endereco.bairro} - {endereco.cidade}/{endereco.uf}
                                                </div>
                                                <div className="endereco-cep">
                                                    CEP: {endereco.cep}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    className="btn-adicionar-endereco-secundario"
                                    onClick={() => setMostrarFormulario(true)}
                                >
                                    + Adicionar Novo Endereço
                                </button>
                            </>
                        )}

                        {mostrarFormulario && (
                            <div className="formulario-endereco">
                                <h3>Adicionar Novo Endereço</h3>
                                <form onSubmit={adicionarEndereco}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>CEP *</label>
                                            <input
                                                type="text"
                                                value={novoEndereco.cep}
                                                onChange={(e) => {
                                                    const cep = e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2');
                                                    setNovoEndereco(prev => ({ ...prev, cep }));
                                                    if (cep.length === 9) {
                                                        buscarCep(cep);
                                                    }
                                                }}
                                                placeholder="00000-000"
                                                maxLength="9"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group flex-3">
                                            <label>Logradouro *</label>
                                            <input
                                                type="text"
                                                value={novoEndereco.logradouro}
                                                onChange={(e) => setNovoEndereco(prev => ({ ...prev, logradouro: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group flex-1">
                                            <label>Número *</label>
                                            <input
                                                type="text"
                                                value={novoEndereco.numero}
                                                onChange={(e) => setNovoEndereco(prev => ({ ...prev, numero: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Complemento</label>
                                            <input
                                                type="text"
                                                value={novoEndereco.complemento}
                                                onChange={(e) => setNovoEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group flex-2">
                                            <label>Bairro *</label>
                                            <input
                                                type="text"
                                                value={novoEndereco.bairro}
                                                onChange={(e) => setNovoEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group flex-2">
                                            <label>Cidade *</label>
                                            <input
                                                type="text"
                                                value={novoEndereco.cidade}
                                                onChange={(e) => setNovoEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group flex-1">
                                            <label>UF *</label>
                                            <input
                                                type="text"
                                                value={novoEndereco.uf}
                                                onChange={(e) => setNovoEndereco(prev => ({ ...prev, uf: e.target.value.toUpperCase() }))}
                                                maxLength="2"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-actions">
                                        <button type="button" onClick={() => setMostrarFormulario(false)}>
                                            Cancelar
                                        </button>
                                        <button type="submit">
                                            Adicionar Endereço
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                <div className="checkout-sidebar">
                    <div className="resumo-pedido">
                        <h3>Resumo do Pedido</h3>
                        <div className="itens-resumo">
                            {cartItems.map(item => (
                                <div key={item.id} className="item-resumo">
                                    <span>{item.nome}</span>
                                    <span>{item.quantidade}x</span>
                                    <span>{formatCurrency(item.preco * item.quantidade)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="total-resumo">
                            <strong>Subtotal: {formatCurrency(calcularSubtotal())}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div className="checkout-actions">
                <button 
                    className="btn-voltar"
                    onClick={() => navigate('/carrinho')}
                >
                    Voltar ao Carrinho
                </button>
                <button 
                    className="btn-continuar"
                    onClick={prosseguir}
                    disabled={!enderecoSelecionado}
                >
                    Continuar para Pagamento
                </button>
            </div>
        </div>
    );
}
