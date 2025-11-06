import React, { useEffect, useState } from 'react';
import api from '../../../services/api';

export default function FreteSelector({ cep, onSelect }) {
  const [opcoes, setOpcoes] = useState(null);
  const [padrao, setPadrao] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function fetchOpcoes() {
      if (!cep) {
        setOpcoes(null);
        setPadrao(null);
        setSelecionado(null);
        return;
      }

      try {
        setLoading(true);
        setErro('');
        const cepLimpo = String(cep).replace(/\D/g, '');
        const response = await api.get(`/api/frete?cep=${encodeURIComponent(cepLimpo)}`);
        const data = response.data;
        if (data && data.opcoes) {
          setOpcoes(data.opcoes);
          setPadrao(data.padrao ?? null);

          // Prefer previously selected frete saved in sessionStorage
          try {
            const saved = sessionStorage.getItem('checkoutFreteSelecionado');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed && parsed.tipo && data.opcoes[parsed.tipo] !== undefined) {
                setSelecionado(parsed.tipo);
                const valor = Number(data.opcoes[parsed.tipo]);
                onSelect && onSelect({ tipo: parsed.tipo, valor });
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            // ignore
          }

          // If no saved selection, select padrao (or first) as before
          let inicialKey = null;
          for (const [k, v] of Object.entries(data.opcoes)) {
            if (data.padrao !== undefined && Number(v) === Number(data.padrao)) {
              inicialKey = k;
              break;
            }
          }
          if (!inicialKey) {
            const keys = Object.keys(data.opcoes);
            if (keys.length > 0) inicialKey = keys[0];
          }

          if (inicialKey) {
            setSelecionado(inicialKey);
            const valor = Number(data.opcoes[inicialKey]);
            onSelect && onSelect({ tipo: inicialKey, valor });
          }
        } else {
          setOpcoes(null);
          setPadrao(null);
          setSelecionado(null);
        }
      } catch (err) {
        console.error('Erro ao obter opções de frete:', err);
        setErro('Não foi possível obter opções de frete');
        setOpcoes(null);
        setPadrao(null);
        setSelecionado(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOpcoes();
  }, [cep]);

  const handleChange = (e, key) => {
    // prevent any parent form submission or navigation
    try { e && e.preventDefault(); e && e.stopPropagation(); } catch (err) {}
    setSelecionado(key);
    if (opcoes && opcoes[key] !== undefined) {
      const valor = Number(opcoes[key]);
      onSelect && onSelect({ tipo: key, valor });
      // persist selection in session so other steps can read it
      try { sessionStorage.setItem('checkoutFreteSelecionado', JSON.stringify({ tipo: key, valor })); } catch(e){}
    }
  };

  if (!cep) return null;

  return (
    <div className="frete-selector">
      <h4>Opções de Frete</h4>
      {loading && <p>Buscando opções...</p>}
      {erro && <p className="error">{erro}</p>}
      {!loading && opcoes && (
        <div className="opcoes-list">
          {Object.entries(opcoes).map(([key, value]) => (
            <label
              key={key}
              style={{ display: 'block', marginBottom: 6 }}
              onClick={(ev) => { try { ev.stopPropagation(); } catch(e){} }}
            >
              <input
                type="radio"
                name="frete"
                value={key}
                checked={selecionado === key}
                onChange={(e) => handleChange(e, key)}
                onClick={(ev) => { try { ev.stopPropagation(); } catch(e){} }}
              />{' '}
              <strong>{key}</strong> — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
            </label>
          ))}
        </div>
      )}
      {!loading && !opcoes && <p>Sem opções de frete disponíveis.</p>}
    </div>
  );
}
