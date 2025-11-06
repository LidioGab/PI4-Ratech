import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import HeaderPesquisa from '../../../components/headerPesquisa';
import './CheckoutEndereco.css';
import FreteSelector from './FreteSelector';

export default function CheckoutEndereco() {
    const { cartItems } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [enderecos, setEnderecos] = useState([]);
    const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
    const [enderecoFaturamento, setEnderecoFaturamento] = useState(null);
    const [usarFaturamentoComoEntrega, setUsarFaturamentoComoEntrega] = useState(false);
    const [fretePadrao, setFretePadrao] = useState(null);
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

            const allEnderecos = response.data.enderecos || [];
            const enderecosEntrega = allEnderecos.filter(endereco =>
                (endereco.tipoEndereco || '').toUpperCase() === 'ENTREGA'
            );
            setEnderecos(enderecosEntrega);

            const fat = allEnderecos.find(end => (end.tipoEndereco || '').toUpperCase() === 'FATURAMENTO');
            setEnderecoFaturamento(fat || null);

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
                // Format CEP as 00000-000 to satisfy backend validation
                const cepLimpo = (novoEndereco.cep || '').replace(/\D/g, '');
                const cepFormatado = cepLimpo.length === 8 ? `${cepLimpo.slice(0,5)}-${cepLimpo.slice(5)}` : novoEndereco.cep;

                const payload = {
                    ...novoEndereco,
                    cep: cepFormatado,
                    estado: novoEndereco.uf,
                    tipoEndereco: 'ENTREGA'
                };

                const response = await api.post(`/api/clientes/${user.id}/enderecos`, payload);

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

    // NOTE: replaced by FreteSelector component below — keep fretePadrao for backward compat
    const fetchFrete = async (cep) => {
        try {
            if (!cep) {
                setFretePadrao(null);
                return;
            }
            const cepLimpo = String(cep).replace(/\D/g, '');
            const response = await api.get(`/api/frete?cep=${encodeURIComponent(cepLimpo)}`);
            if (response.data && response.data.padrao !== undefined) {
                setFretePadrao(Number(response.data.padrao));
            } else {
                setFretePadrao(null);
            }
        } catch (err) {
            console.error('Erro ao obter frete:', err);
            setFretePadrao(null);
        }
    };

    // Quando a seleção de endereço mudar, obter estimativa de frete
    useEffect(() => {
        if (usarFaturamentoComoEntrega && enderecoFaturamento) {
            fetchFrete(enderecoFaturamento.cep);
        } else if (enderecoSelecionado) {
            const e = enderecos.find(x => x.id === enderecoSelecionado);
            if (e) fetchFrete(e.cep);
        } else {
            setFretePadrao(null);
        }
    }, [enderecoSelecionado, usarFaturamentoComoEntrega, enderecoFaturamento]);

    const prosseguir = () => {
        // Se estiver usando faturamento como entrega, use esse endereço
        const endereco = usarFaturamentoComoEntrega ? enderecoFaturamento : enderecos.find(e => e.id === enderecoSelecionado);
        if (!endereco) {
            setError('Selecione um endereço de entrega');
            return;
        }

        const enderecoParaSalvar = { ...endereco };
        if (!enderecoParaSalvar.estado && enderecoParaSalvar.uf) enderecoParaSalvar.estado = enderecoParaSalvar.uf;

        sessionStorage.setItem('checkoutEndereco', JSON.stringify(enderecoParaSalvar));
        // também salvar frete selecionado (se o usuário já escolheu uma opção)
        try {
            const sel = sessionStorage.getItem('checkoutFreteSelecionado');
            if (sel) {
                // keep existing selection
            } else if (fretePadrao !== null && fretePadrao !== undefined) {
                sessionStorage.setItem('checkoutFreteSelecionado', JSON.stringify({ tipo: 'Padrão', valor: Number(fretePadrao) }));
            }
        } catch (e) {}

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
        <div className="">
            <HeaderPesquisa />
            <div className='checkout-endereco-container'>
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
                                    {enderecoFaturamento && (
                                        <div className="usar-faturamento">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={usarFaturamentoComoEntrega}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setUsarFaturamentoComoEntrega(checked);
                                                        if (checked && enderecoFaturamento) {
                                                            setEnderecoSelecionado(enderecoFaturamento.id);
                                                            fetchFrete(enderecoFaturamento.cep);
                                                        }
                                                    }}
                                                />
                                                Usar o mesmo endereço de faturamento como endereço de entrega
                                            </label>
                                        </div>
                                    )}
                                    {/* frete selector moved below so it's shown whether the user has addresses or not */}
                                </div>
                            ) : (
                                <>
                                    {enderecoFaturamento && (
                                        <div className="usar-faturamento-global">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={usarFaturamentoComoEntrega}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setUsarFaturamentoComoEntrega(checked);
                                                        if (checked && enderecoFaturamento) {
                                                            setEnderecoSelecionado(enderecoFaturamento.id);
                                                            fetchFrete(enderecoFaturamento.cep);
                                                        } else {
                                                            // quando desmarca, limpar estimativa
                                                            setFretePadrao(null);
                                                        }
                                                    }}
                                                />
                                                Usar o mesmo endereço de faturamento como endereço de entrega
                                            </label>
                                        </div>
                                    )}
                                    <div className="enderecos-list">
                                        {enderecos.map(endereco => (
                                            <div
                                                key={endereco.id}
                                                className={`endereco-card ${enderecoSelecionado === endereco.id ? 'selecionado' : ''}`}
                                                onClick={() => { if (!usarFaturamentoComoEntrega) { setEnderecoSelecionado(endereco.id); fetchFrete(endereco.cep); } }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="endereco"
                                                    value={endereco.id}
                                                    checked={enderecoSelecionado === endereco.id}
                                                    onChange={() => { setEnderecoSelecionado(endereco.id); fetchFrete(endereco.cep); }}
                                                    disabled={usarFaturamentoComoEntrega}
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

                            {/* Mostrar o seletor de frete aqui, abaixo da lista de endereços/formulação */}
                            <div style={{ marginTop: 12 }}>
                                <FreteSelector
                                    cep={usarFaturamentoComoEntrega && enderecoFaturamento ? enderecoFaturamento.cep : (enderecos.find(x => x.id === enderecoSelecionado)?.cep)}
                                    onSelect={(sel) => {
                                        if (sel && sel.valor !== undefined) {
                                            setFretePadrao(Number(sel.valor));
                                            try { sessionStorage.setItem('checkoutFreteSelecionado', JSON.stringify(sel)); } catch(e){}
                                        }
                                    }}
                                />
                            </div>

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
                                {fretePadrao !== null && (
                                    <div className="resumo-frete">
                                        <span>Frete (estimado):</span>
                                        <span>{formatCurrency(fretePadrao)}</span>
                                    </div>
                                )}
                                {fretePadrao !== null && (
                                    <div className="resumo-total">
                                        <strong>Total estimado: {formatCurrency(calcularSubtotal() + Number(fretePadrao))}</strong>
                                    </div>
                                )}
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
        </div>
    );
}
