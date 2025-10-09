import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import './FreteCalculator.css';

const API_BASE_URL = 'http://localhost:8080/api/frete';

const FreteCalculator = ({ showSubtotal = false }) => {
    const { getSubtotal } = useCart();
    const [cep, setCep] = useState('');
    const [opcoesFrete, setOpcoesFrete] = useState(null);
    const [valorFreteSelecionado, setValorFreteSelecionado] = useState(0.0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const subtotal = getSubtotal();

    useEffect(() => {
        // Reset frete quando o carrinho muda
        if (!subtotal || subtotal === 0) {
            setOpcoesFrete(null);
            setValorFreteSelecionado(0);
        }
    }, [subtotal]);

    const calcularFrete = async () => {
        const cepLimpo = cep.replace(/[^0-9]/g, '');

        if (cepLimpo.length !== 8) {
            setError("Digite um CEP válido.");
            setOpcoesFrete(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/${cepLimpo}`);

            if (!response.ok) {
                throw new Error("Erro ao buscar frete.");
            }

            const data = await response.json();
            setOpcoesFrete(data);


            const primeiraOpcao = Object.values(data)[0] || 0.0;
            setValorFreteSelecionado(primeiraOpcao);

        } catch (err) {
            setError(`Falha: ${err.message}.`);
        } finally {
            setLoading(false);
        }
    };


    const handleFreteChange = (e) => {
        setValorFreteSelecionado(parseFloat(e.target.value));
    };

    return (
        <div className="frete-calculator">
            <h3 className="frete-title">📦 Calcular Frete e Prazo</h3>

            {showSubtotal && subtotal > 0 && (
                <div className="subtotal-info">
                    <span>Subtotal: R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
            )}

            <div className="cep-input-group">
                <input
                    type="text"
                    placeholder="00000-000"
                    maxLength="9"
                    value={cep}
                    onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 5) {
                            value = value.replace(/(\d{5})(\d)/, '$1-$2');
                        }
                        setCep(value);
                    }}
                    className="cep-input"
                />
                <button onClick={calcularFrete} disabled={loading} className="calcular-btn">
                    {loading ? (
                        <span className="loading-spinner">⏳</span>
                    ) : (
                        'Calcular'
                    )}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <span>❌ {error}</span>
                </div>
            )}

            {opcoesFrete && (
                <div className="opcoes-frete">
                    <h4 className="opcoes-title">Opções de entrega:</h4>
                    <div className="opcoes-list">
                        {Object.entries(opcoesFrete).map(([tipo, valor]) => (
                            <label key={tipo} className="opcao-frete">
                                <input
                                    type="radio"
                                    name="frete"
                                    value={valor}
                                    onChange={handleFreteChange}
                                    checked={valorFreteSelecionado === valor}
                                    className="radio-input"
                                />
                                <div className="opcao-info">
                                    <span className="tipo-frete">{tipo}</span>
                                    <span className="valor-frete">R$ {valor.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {showSubtotal && valorFreteSelecionado > 0 && (
                <div className="total-section">
                    <div className="total-breakdown">
                        <div className="breakdown-item">
                            <span>Subtotal:</span>
                            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="breakdown-item">
                            <span>Frete:</span>
                            <span>R$ {valorFreteSelecionado.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="breakdown-total">
                            <span>Total:</span>
                            <span>R$ {(subtotal + valorFreteSelecionado).toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FreteCalculator;
