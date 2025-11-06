import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import './CheckoutPagamento.css';
import HeaderPesquisa from '../../../components/headerPesquisa';

const CheckoutPagamento = () => {
    const navigate = useNavigate();
    const { cart, total } = useCart();

    const [formaPagamento, setFormaPagamento] = useState('boleto');
    const [dadosCartao, setDadosCartao] = useState({
        numero: '',
        nome: '',
        vencimento: '',
        cvv: '',
        parcelas: '1'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Verificar se o carrinho não está vazio
        if (!cart || cart.length === 0) {
            navigate('/checkout/endereco');
            return;
        }

        // Verificar se usuário está logado - IGUAL ao perfil cliente
        const cliente = localStorage.getItem('clienteSession');
        if (!cliente) {
            localStorage.setItem('redirectAfterLogin', '/checkout/pagamento');
            navigate('/login');
            return;
        }

        // Verificar se existe endereço selecionado
        const enderecoSelecionado = sessionStorage.getItem('checkoutEndereco');
        if (!enderecoSelecionado) {
            navigate('/checkout/endereco');
            return;
        }
    }, [cart, navigate]);

    const formatarNumeroCartao = (valor) => {
        const numero = valor.replace(/\D/g, '');
        return numero.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    const formatarVencimento = (valor) => {
        const vencimento = valor.replace(/\D/g, '');
        if (vencimento.length >= 2) {
            return vencimento.substring(0, 2) + '/' + vencimento.substring(2, 4);
        }
        return vencimento;
    };

    const validarCartao = () => {
        const newErrors = {};

        if (formaPagamento === 'cartao') {
            if (!dadosCartao.numero.replace(/\s/g, '')) {
                newErrors.numero = 'Número do cartão é obrigatório';
            } else if (dadosCartao.numero.replace(/\s/g, '').length < 16) {
                newErrors.numero = 'Número do cartão deve ter 16 dígitos';
            }

            if (!dadosCartao.nome.trim()) {
                newErrors.nome = 'Nome do portador é obrigatório';
            }

            if (!dadosCartao.vencimento) {
                newErrors.vencimento = 'Data de vencimento é obrigatória';
            } else {
                const [mes, ano] = dadosCartao.vencimento.split('/');
                const dataAtual = new Date();
                const anoAtual = dataAtual.getFullYear() % 100;
                const mesAtual = dataAtual.getMonth() + 1;

                if (!mes || !ano || mes < 1 || mes > 12) {
                    newErrors.vencimento = 'Data de vencimento inválida';
                } else if (parseInt(ano) < anoAtual || (parseInt(ano) === anoAtual && parseInt(mes) < mesAtual)) {
                    newErrors.vencimento = 'Cartão vencido';
                }
            }

            if (!dadosCartao.cvv) {
                newErrors.cvv = 'CVV é obrigatório';
            } else if (dadosCartao.cvv.length < 3) {
                newErrors.cvv = 'CVV deve ter pelo menos 3 dígitos';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calcularParcelamento = () => {
        const parcelas = [];
        const valorMinimoParcela = 50;
        const maxParcelas = Math.min(12, Math.floor(total / valorMinimoParcela));

        for (let i = 1; i <= maxParcelas; i++) {
            const valorParcela = total / i;
            const juros = i > 1 ? (i - 1) * 0.02 : 0; // 2% de juros por parcela acima de 1x
            const valorComJuros = total * (1 + juros);
            const valorParcelaComJuros = valorComJuros / i;

            parcelas.push({
                numero: i,
                valor: valorParcelaComJuros,
                total: valorComJuros,
                semJuros: i === 1
            });
        }

        return parcelas;
    };

    const handleInputChange = (field, value) => {
        if (field === 'numero') {
            value = formatarNumeroCartao(value);
            if (value.replace(/\s/g, '').length > 16) return;
        } else if (field === 'vencimento') {
            value = formatarVencimento(value);
            if (value.replace(/\D/g, '').length > 4) return;
        } else if (field === 'cvv') {
            value = value.replace(/\D/g, '');
            if (value.length > 4) return;
        } else if (field === 'nome') {
            value = value.toUpperCase();
        }

        setDadosCartao(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleContinuar = () => {
        if (formaPagamento === 'cartao' && !validarCartao()) {
            return;
        }

        // Salvar dados do pagamento no sessionStorage
        const dadosPagamento = {
            formaPagamento,
            ...(formaPagamento === 'cartao' && {
                dadosCartao: {
                    ...dadosCartao,
                    numero: dadosCartao.numero.replace(/\s/g, '').replace(/\d(?=\d{4})/g, '*')
                }
            })
        };

        sessionStorage.setItem('checkoutPagamento', JSON.stringify(dadosPagamento));
        navigate('/checkout/resumo');
    };

    const handleVoltar = () => {
        navigate('/checkout/endereco');
    };

    const opcoesParcelas = calcularParcelamento();

    if (loading) {
        return (
            <div className="checkout-loading">
                Carregando dados do pagamento...
            </div>
        );
    }

    return (
        <div className="">
            <HeaderPesquisa/>
            <div className='checkout-pagamento-container'>
                <div className="checkout-header">
                    <h1>Finalizar Compra</h1>
                    <div className="checkout-steps">
                        <div className="step">1. Endereço</div>
                        <div className="step active">2. Pagamento</div>
                        <div className="step">3. Resumo</div>
                    </div>
                </div>

                <div className="checkout-content">
                    <div className="checkout-main">
                        <div className="pagamento-section">
                            <h2>Forma de Pagamento</h2>

                            <div className="formas-pagamento">
                                <div className="forma-pagamento-opcao">
                                    <label className="radio-container">
                                        <input
                                            type="radio"
                                            name="formaPagamento"
                                            value="boleto"
                                            checked={formaPagamento === 'boleto'}
                                            onChange={(e) => setFormaPagamento(e.target.value)}
                                        />
                                        <span className="checkmark"></span>
                                        <div className="opcao-content">
                                            <h3>Boleto Bancário</h3>
                                            <p>Pagamento à vista com desconto de 5%</p>
                                            <div className="opcao-valor">
                                                <span className="valor-original">R$ {total.toFixed(2)}</span>
                                                <span className="valor-desconto">R$ {(total * 0.95).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <div className="forma-pagamento-opcao">
                                    <label className="radio-container">
                                        <input
                                            type="radio"
                                            name="formaPagamento"
                                            value="cartao"
                                            checked={formaPagamento === 'cartao'}
                                            onChange={(e) => setFormaPagamento(e.target.value)}
                                        />
                                        <span className="checkmark"></span>
                                        <div className="opcao-content">
                                            <h3>Cartão de Crédito</h3>
                                            <p>Parcelamento em até {opcoesParcelas.length}x no cartão</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {formaPagamento === 'cartao' && (
                                <div className="dados-cartao">
                                    <h3>Dados do Cartão</h3>

                                    <div className="form-row">
                                        <div className="form-group flex-2">
                                            <label>Número do Cartão</label>
                                            <input
                                                type="text"
                                                value={dadosCartao.numero}
                                                onChange={(e) => handleInputChange('numero', e.target.value)}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                            />
                                            {errors.numero && <div className="error-text">{errors.numero}</div>}
                                        </div>

                                        <div className="form-group flex-1">
                                            <label>CVV</label>
                                            <input
                                                type="text"
                                                value={dadosCartao.cvv}
                                                onChange={(e) => handleInputChange('cvv', e.target.value)}
                                                placeholder="123"
                                                maxLength="4"
                                            />
                                            {errors.cvv && <div className="error-text">{errors.cvv}</div>}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group flex-2">
                                            <label>Nome do Portador</label>
                                            <input
                                                type="text"
                                                value={dadosCartao.nome}
                                                onChange={(e) => handleInputChange('nome', e.target.value)}
                                                placeholder="Nome como impresso no cartão"
                                            />
                                            {errors.nome && <div className="error-text">{errors.nome}</div>}
                                        </div>

                                        <div className="form-group flex-1">
                                            <label>Vencimento</label>
                                            <input
                                                type="text"
                                                value={dadosCartao.vencimento}
                                                onChange={(e) => handleInputChange('vencimento', e.target.value)}
                                                placeholder="MM/AA"
                                                maxLength="5"
                                            />
                                            {errors.vencimento && <div className="error-text">{errors.vencimento}</div>}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Parcelamento</label>
                                            <select
                                                value={dadosCartao.parcelas}
                                                onChange={(e) => setDadosCartao(prev => ({ ...prev, parcelas: e.target.value }))}
                                            >
                                                {opcoesParcelas.map(parcela => (
                                                    <option key={parcela.numero} value={parcela.numero}>
                                                        {parcela.numero}x de R$ {parcela.valor.toFixed(2)}
                                                        {parcela.semJuros ? ' sem juros' : ` (Total: R$ ${parcela.total.toFixed(2)})`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="checkout-sidebar">
                        <div className="resumo-pedido">
                            <h3>Resumo do Pedido</h3>

                            <div className="itens-resumo">
                                {cart.map(item => (
                                    <div key={item.id} className="item-resumo">
                                        <div className="item-nome">
                                            {item.nome} x{item.quantidade}
                                        </div>
                                        <div className="item-valor">
                                            R$ {(item.preco * item.quantidade).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="total-resumo">
                                <div className="subtotal">
                                    Subtotal: R$ {total.toFixed(2)}
                                </div>

                                {formaPagamento === 'boleto' && (
                                    <>
                                        <div className="desconto">
                                            Desconto (5%): -R$ {(total * 0.05).toFixed(2)}
                                        </div>
                                        <div className="total-final">
                                            <strong>Total: R$ {(total * 0.95).toFixed(2)}</strong>
                                        </div>
                                    </>
                                )}

                                {formaPagamento === 'cartao' && (
                                    <div className="total-final">
                                        <strong>
                                            Total: R$ {
                                                opcoesParcelas.find(p => p.numero === parseInt(dadosCartao.parcelas))?.total.toFixed(2) || total.toFixed(2)
                                            }
                                        </strong>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="checkout-actions">
                    <button type="button" className="btn-voltar" onClick={handleVoltar}>
                        Voltar
                    </button>
                    <button
                        type="button"
                        className="btn-continuar"
                        onClick={handleContinuar}
                    >
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPagamento;
