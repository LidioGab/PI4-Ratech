import React, { useState, useEffect } from 'react';

const SUBTOTAL_INICIAL = 120.0;
const API_BASE_URL = 'http://localhost:8080/api/frete';

const FreteCalculator = () => {
    const [cep, setCep] = useState('');
    const [opcoesFrete, setOpcoesFrete] = useState(null);
    const [valorFreteSelecionado, setValorFreteSelecionado] = useState(0.0);
    const [total, setTotal] = useState(SUBTOTAL_INICIAL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    useEffect(() => {
        setTotal(SUBTOTAL_INICIAL + valorFreteSelecionado);
    }, [valorFreteSelecionado]);

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
        <div style={{ padding: '20px', border: '1px solid #ddd' }}>
            <h2>Calcular Frete</h2>
            <p>Subtotal: R$ {SUBTOTAL_INICIAL.toFixed(2)}</p>


            <input
                type="text"
                placeholder="Digite seu CEP"
                maxLength="8"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
            />
            <button onClick={calcularFrete} disabled={loading}>
                {loading ? 'Calculando...' : 'Calcular Frete'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}


            {opcoesFrete && (
                <div style={{ marginTop: '15px' }}>
                    <h4>Opções:</h4>
                    {Object.entries(opcoesFrete).map(([tipo, valor]) => (
                        <div key={tipo}>
                            <label>
                                <input
                                    type="radio"
                                    name="frete"
                                    value={valor}
                                    onChange={handleFreteChange}

                                    checked={valorFreteSelecionado === valor}
                                />
                                **{tipo}**: R$ {valor.toFixed(2)}
                            </label>
                        </div>
                    ))}
                </div>
            )}


            <h3 style={{ marginTop: '20px' }}>
                Total: R$ {total.toFixed(2)}
            </h3>
        </div>
    );
};

export default FreteCalculator;