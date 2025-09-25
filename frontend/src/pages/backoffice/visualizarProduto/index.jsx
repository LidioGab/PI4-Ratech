import './index.css';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import placeholder from '../../../assets/images/product-placeholder.svg';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';
import { useAuth } from '../../../context/AuthContext.jsx';

export default function VisualizarProduto(){
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [produto,setProduto] = useState(null);
  const [loading,setLoading] = useState(true);
  const [erro,setErro] = useState(null);
  const [imagemAtual,setImagemAtual] = useState(null);
  const [indiceAtual,setIndiceAtual] = useState(0);

  useEffect(()=>{ buscar(); },[id]);

  async function buscar(){
    try{
      setLoading(true);
      const resp = await api.get(`/produtos/${id}`);
      const p = resp.data;
      setProduto(p);
      if(p.imagens && p.imagens.length>0){
        const principal = p.imagens.find(i=>i.imagemPrincipal) || p.imagens[0];
        const idx = p.imagens.findIndex(i=>i.id===principal.id);
        setImagemAtual(principal);
        setIndiceAtual(idx>=0? idx:0);
      } else {
        setIndiceAtual(0);
      }
      setErro(null);
    }catch(e){
      console.error(e);
      setErro('Não foi possível carregar o produto');
    }finally{ setLoading(false); }
  }

  function formatMoney(v){
    if(v==null) return '-';
    try{ return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch(e){return v;}
  }

  // Derivar imagens sempre que produto mudar
  const imagens = produto?.imagens || [];
  const baseURL = api.defaults.baseURL?.replace(/\/$/,'') || '';

  const irPara = useCallback((novo)=>{
    if(!imagens.length) return;
    const total = imagens.length;
    let idx = (novo + total) % total;
    setIndiceAtual(idx);
    setImagemAtual(imagens[idx]);
  },[imagens]);

  const prox = useCallback(()=>{ irPara(indiceAtual+1); },[irPara, indiceAtual]);
  const anterior = useCallback(()=>{ irPara(indiceAtual-1); },[irPara, indiceAtual]);

  useEffect(()=>{
    function handleKey(e){
      if(e.key==='ArrowRight') prox();
      else if(e.key==='ArrowLeft') anterior();
    }
    window.addEventListener('keydown', handleKey);
    return ()=> window.removeEventListener('keydown', handleKey);
  },[prox, anterior]);

  function buildSrc(img){
    if(!img) return placeholder;
    const path = (img.diretorio || '') + img.nomeArquivo;
    if(/^https?:/i.test(path)) return path;
    return baseURL + (path.startsWith('/')? path : '/' + path);
  }

  function handleImgError(ev){ ev.currentTarget.src = placeholder; }

  // Após todos os hooks, fazer retornos condicionais
  if(!user || (user.grupo !== 'Administrador' && user.grupo !== 'Estoquista')){
    return <div className="loading-box">Acesso não autorizado</div>;
  }
  if(loading){ return <div className="loading-box">Carregando produto...</div>; }
  if(erro){ return <div className="erro-box">{erro}<br/><button onClick={buscar} className="voltar-btn">Tentar novamente</button></div>; }
  if(!produto){ return <div className="erro-box">Produto não encontrado</div>; }

  return (
    <div className="admin-layout">
      <MenuLateral />
      <div className="admin-content">
        <Header nome={"Visualização de Produto"} />
        <div className="visualizar-produto-page">
          <div className="visualizar-produto-header">
            <h1>{produto.nome}</h1>
            <div style={{display:'flex',gap:12}}>
              <button className="voltar-btn" onClick={()=>navigate('/produtos')}>Voltar</button>
            </div>
          </div>
          <div className="produto-meta">
            <span>ID: {produto.id}</span>
            <span className={"badge-status "+(produto.status? 'ativo':'inativo')}>{produto.status? 'Ativo':'Inativo'}</span>
            {produto.avaliacao && <span>Avaliação: {produto.avaliacao}</span>}
            <span>Estoque: {produto.quantidadeEstoque}</span>
            <span>Preço: {formatMoney(produto.preco)}</span>
          </div>

          <div className="produto-container">
            <div className="galeria-principal">
              <div className="carousel-wrapper">
                {(imagemAtual || imagens.length>0) ? (
                  <>
                    <button className="nav prev" onClick={anterior} disabled={imagens.length<=1}>◀</button>
                    <img src={buildSrc(imagemAtual)} onError={handleImgError} alt={produto.nome} />
                    <button className="nav next" onClick={prox} disabled={imagens.length<=1}>▶</button>
                  </>
                ) : (
                  <img src={placeholder} alt="placeholder" style={{opacity:.7}} />
                )}
              </div>
              {imagens.length>1 && (
                <div style={{display:'flex',justifyContent:'center',gap:6,fontSize:11,color:'#555'}}>
                  {imagens.map((_,i)=>(
                    <span key={i} style={{width:8,height:8,borderRadius:'50%',background:i===indiceAtual?'#2563eb':'#cbd5e1',display:'inline-block'}} />
                  ))}
                </div>
              )}
              {imagens.length>1 && (
                <div className="thumbs">
                  {imagens.map(img => (
                    <button key={img.id} className={imagemAtual && imagemAtual.id===img.id? 'active':''}
                      onClick={()=>{setImagemAtual(img); setIndiceAtual(imagens.findIndex(i=>i.id===img.id));}}>
                      <img src={buildSrc(img)} onError={handleImgError} alt="thumb" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="info-card">
              <div className="info-grid">
                <div className="field-block">
                  <label>Nome</label>
                  <span>{produto.nome}</span>
                </div>
                <div className="field-block">
                  <label>Preço</label>
                  <span>{formatMoney(produto.preco)}</span>
                </div>
                <div className="field-block">
                  <label>Estoque</label>
                  <span>{produto.quantidadeEstoque}</span>
                </div>
                <div className="field-block">
                  <label>Avaliação</label>
                  <span>{produto.avaliacao || '-'}</span>
                </div>
                <div className="field-block">
                  <label>Status</label>
                  <span>{produto.status? 'Ativo':'Inativo'}</span>
                </div>
                <div className="field-block">
                  <label>Criação</label>
                  <span>{produto.dataCriacao ? new Date(produto.dataCriacao).toLocaleString('pt-BR') : '-'}</span>
                </div>
              </div>
              <div>
                <label style={{fontWeight:600,fontSize:12,textTransform:'uppercase',color:'#444',letterSpacing:'.5px'}}>Descrição</label>
                <div className="descricao-box">{produto.descricao}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
