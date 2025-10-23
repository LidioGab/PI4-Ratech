import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import api, { addresses } from '../../../services/api.js';
import './index.css';

function EnderecoForm({ onSaved, initial = {} }){
  const [form, setForm] = useState({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', nomeRecebedor: '', ...initial });
  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function buscarCep(e){
    const cep = form.cep.replace(/[^0-9]/g, '');
    if(cep.length !== 8) return;
    setLoadingCep(true);
    try{
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await r.json();
      if(data.erro) { setError('CEP não encontrado'); }
      else setForm(f => ({ ...f, logradouro: data.logradouro||f.logradouro, bairro: data.bairro||f.bairro, cidade: data.localidade||f.cidade, uf: data.uf||f.uf }));
    }catch(err){ setError('Erro consultando CEP'); }
    setLoadingCep(false);
  }

  function change(e){ setForm(s => ({ ...s, [e.target.name]: e.target.value })); }

  async function submit(ev){
    ev.preventDefault();
    setError(null);
    if(!form.cep || !form.logradouro || !form.numero || !form.bairro || !form.cidade || !form.uf || !form.nomeRecebedor){ setError('Preencha todos os campos obrigatórios'); return; }
    try{
      setSaving(true);
      await onSaved(form);
      setForm({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', nomeRecebedor: '' });
      setSaving(false);
    }catch(e){ setError(e.message || 'Erro salvando'); }
  }

  return (
    <form className="meus-enderecos-form" onSubmit={submit}>
      {initial && initial.id && <div style={{marginBottom:8}}><strong>Editar endereço</strong></div>}
      {initial && initial.id && <div style={{marginBottom:8}}><button type="button" onClick={() => { onSaved({ __delete: true, id: initial.id }); }}>Remover este endereço</button></div>}
      <div className="row"><label>CEP</label><input name="cep" value={form.cep} onChange={change} onBlur={buscarCep} /></div>
      <div className="row"><label>Logradouro</label><input name="logradouro" value={form.logradouro} onChange={change} /></div>
      <div className="row"><label>Número</label><input name="numero" value={form.numero} onChange={change} /></div>
      <div className="row"><label>Complemento</label><input name="complemento" value={form.complemento} onChange={change} /></div>
      <div className="row"><label>Bairro</label><input name="bairro" value={form.bairro} onChange={change} /></div>
      <div className="row"><label>Cidade</label><input name="cidade" value={form.cidade} onChange={change} /></div>
      <div className="row"><label>UF</label><input name="uf" value={form.uf} onChange={change} /></div>
      <div className="row"><label>Nome Recebedor</label><input name="nomeRecebedor" value={form.nomeRecebedor} onChange={change} /></div>
      {error && <div className="error">{error}</div>}
      <div className="actions"><button type="submit" disabled={saving}>{saving? 'Salvando...':'Salvar endereço'}</button></div>
    </form>
  );
}

export default function MeusEnderecos(){
  const { user } = useAuth();
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingDefault, setSettingDefault] = useState(false);
  const [editing, setEditing] = useState(null); // endereco sendo editado

  useEffect(() => {
    if(!user) return; 
    (async ()=>{
      setLoading(true);
      try{
        const r = await addresses.list(user.id);
        setEnderecos(r.data || []);
      }catch(err){ console.error(err); }
      setLoading(false);
    })();
  }, [user]);

  async function handleSave(form){
    if(!user) throw new Error('Usuário não autenticado');
    // se contém __delete => deletar
    if(form.__delete && form.id){
      await addresses.remove(user.id, form.id);
      setEnderecos(e => e.filter(x => x.id !== form.id));
      setEditing(null);
      return;
    }
    if(form.id){
      // atualizar
      const r = await addresses.update(user.id, form.id, form);
      setEnderecos(e => e.map(x => x.id === form.id ? r.data : x));
      setEditing(null);
      return;
    }
    const r = await addresses.create(user.id, form);
    setEnderecos(e => [...e, r.data]);
  }

  async function setDefault(id){
    if(!user) return;
    setSettingDefault(true);
    try{
      await addresses.setDefault(user.id, id);
      setEnderecos(e => e.map(x => ({ ...x, enderecoPadrao: x.id === id })));
    }catch(err){ console.error(err); }
    setSettingDefault(false);
  }

  function startEdit(ed){
    setEditing(ed);
  }

  function copyFromFaturamento(){
    if(!user || !user.enderecoFaturamento) return;
    setEditing({ ...user.enderecoFaturamento });
  }

  if(!user) return <div className="meus-enderecos-page"><h2>Meus Endereços</h2><p>Você precisa estar logado para gerenciar endereços.</p></div>;

  return (
    <div className="meus-enderecos-page">
      <h2>Meus Endereços</h2>
      <div className="container">
        <div className="lista">
          <h3>Endereços</h3>
          {loading ? <p>Carregando...</p> : (
            enderecos.length === 0 ? <p>Nenhum endereço cadastrado</p> : (
              <ul>
                {enderecos.map(ed => (
                  <li key={ed.id} className={ed.enderecoPadrao? 'default': ''}>
                    <div>{ed.logradouro}, {ed.numero} {ed.complemento}</div>
                    <div>{ed.bairro} - {ed.cidade}/{ed.uf} - CEP: {ed.cep}</div>
                    <div>Recebedor: {ed.nomeRecebedor}</div>
                    <div className="actions">
                      {!ed.enderecoPadrao && <button disabled={settingDefault} onClick={() => setDefault(ed.id)}>{settingDefault? 'Aguarde...':'Tornar padrão'}</button>}
                      {ed.enderecoPadrao && <span>Padrão</span>}
                      <button onClick={() => startEdit(ed)} style={{marginLeft:8}}>Editar</button>
                      <button onClick={async ()=>{ if(confirm('Confirma remoção?')){ await addresses.remove(user.id, ed.id); setEnderecos(e => e.filter(x=>x.id!==ed.id)); } }} style={{marginLeft:8}}>Remover</button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
        <div className="form">
          <h3>Adicionar Endereço</h3>
          <div style={{marginBottom:8}}>
            <button onClick={copyFromFaturamento} disabled={!user || !user.enderecoFaturamento}>Copiar do endereço de faturamento</button>
          </div>
          <EnderecoForm onSaved={handleSave} initial={editing||{}} />
        </div>
      </div>
    </div>
  );
}
