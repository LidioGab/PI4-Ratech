import './index.css';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';
import { useAuth } from '../../../context/AuthContext.jsx';

export default function EditarProduto(){
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [produto,setProduto] = useState(null);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [feedback,setFeedback] = useState(null);
  const [form,setForm] = useState({nome:'',preco:'',avaliacao:'',quantidadeEstoque:'',descricao:'',status:true});
  const [errors,setErrors] = useState({});
  const [uploading,setUploading] = useState(false);
  const [novasImagens,setNovasImagens] = useState([]); // {file,urlPreview}
  const [principalUpload,setPrincipalUpload] = useState(null); // index dentro de novasImagens

  const isAdmin = user?.grupo === 'Administrador';
  const isEstoquista = user?.grupo === 'Estoquista';

  useEffect(()=>{ carregar(); },[id]);

  async function carregar(){
    try{
      setLoading(true);
      const resp = await api.get(`/produtos/${id}`);
      const p = resp.data;
      if(p.imagens){
        p.imagens = [...p.imagens].sort((a,b)=> (b.imagemPrincipal===true) - (a.imagemPrincipal===true));
      }
      setProduto(p);
      setForm({
        nome: p.nome||'',
        preco: p.preco!=null? Number(p.preco).toFixed(2):'',
        avaliacao: p.avaliacao!=null? p.avaliacao:'',
        quantidadeEstoque: p.quantidadeEstoque!=null? p.quantidadeEstoque:'',
        descricao: p.descricao||'',
        status: p.status
      });
      setFeedback(null);
    }catch(e){
      console.error(e);
      setFeedback({type:'err', msg:'Falha ao carregar produto'});
    }finally{ setLoading(false); }
  }

  function handleChange(e){
    const {name,value} = e.target;
    setForm(f=>({...f,[name]:value}));
  }

  function validateFields(current){
    const e = {};
    const f = current || form;
    if(isAdmin){
      if(!f.nome || f.nome.length>200) e.nome = 'Informe o nome (máx 200)';
      const preco = parseFloat(f.preco);
      if(isNaN(preco) || preco<=0) e.preco = 'Preço inválido';
      if(f.avaliacao!==''){
        const av = parseFloat(f.avaliacao);
        if(isNaN(av) || av<1 || av>5 || (av*10)%5!==0) e.avaliacao = 'Avaliação 1-5 passo 0.5';
      }
      if(!f.descricao || f.descricao.length>2000) e.descricao = 'Descrição obrigatória (<=2000)';
    }
    const qtd = parseInt(f.quantidadeEstoque);
    if(isNaN(qtd) || qtd<0) e.quantidadeEstoque = 'Qtd inválida';
    return e;
  }

  function validate(){
    const e = validateFields();
    setErrors(e);
    return Object.keys(e).length===0;
  }

  async function salvar(){
    if(!validate()){
      setFeedback({type:'err', msg:'Corrija os campos destacados'});
      return;
    }
    try{
      setSaving(true);
      setFeedback(null);
      const payload = {};
      if(isAdmin){
        payload.nome = form.nome;
        payload.preco = parseFloat(form.preco);
        payload.descricao = form.descricao;
        payload.quantidadeEstoque = parseInt(form.quantidadeEstoque);
        payload.avaliacao = form.avaliacao===''? null: parseFloat(form.avaliacao);
      } else if(isEstoquista){
        payload.quantidadeEstoque = parseInt(form.quantidadeEstoque);
      }
      const resp = await api.put(`/produtos/${id}`, payload);
      // se houver novas imagens, enviar depois de atualizar produto
      if(isAdmin && novasImagens.length){
        setUploading(true);
        const formData = new FormData();
        novasImagens.forEach(n=> formData.append('files', n.file));
        if(principalUpload!=null) formData.append('principalIndex', principalUpload);
        try{
          await api.post(`/produtos/${id}/imagens`, formData);
          setNovasImagens([]);
          setPrincipalUpload(null);
        }catch(imgErr){
          console.error(imgErr);
          setFeedback({type:'err', msg:'Produto salvo, mas falha ao enviar imagens'});
          await carregar();
          return;
        } finally { setUploading(false); }
      }
      setProduto(resp.data);
      setFeedback({type:'ok', msg: novasImagens.length? 'Produto e imagens atualizados' : 'Produto atualizado'});
    }catch(e){
      console.error(e);
      setFeedback({type:'err', msg:'Erro ao salvar'});
    }finally{ setSaving(false); }
  }

  async function toggleStatus(){
    try{
      await api.put(`/produtos/${id}/status`);
      await carregar();
      setFeedback({type:'ok', msg:'Status atualizado'});
    }catch(e){
      setFeedback({type:'err', msg:'Falha ao alterar status'});
    }
  }

  function handleFileChange(e){
    const files = Array.from(e.target.files||[]);
    if(!files.length) return;
    const mapped = files.map(f=>({file:f,urlPreview:URL.createObjectURL(f)}));
    setNovasImagens(prev=>[...prev,...mapped]);
    if(principalUpload==null) setPrincipalUpload(0);
  }
  
  function imagemUrl(img){
    if(!img) return '';
    if(img.urlPreview) return img.urlPreview; 
    if(img.diretorio && img.nomeArquivo){
      let dir = img.diretorio.replace(/\\/g,'/');
      if(!dir.endsWith('/')) dir += '/';
      if(/^\/?uploads\//i.test(dir)){
        dir = dir.replace(/^\/?/, '/');
        return `${api.defaults.baseURL}${dir}${img.nomeArquivo}`;
      }
      dir = dir.replace(/^\//,'');
      return `${api.defaults.baseURL}/uploads/${dir}${img.nomeArquivo}`;
    }
    return '';
  }

  async function definirPrincipal(imagemId){
    if(!isAdmin) return;
    try{
      await api.put(`/produtos/${id}/imagens/${imagemId}/principal`);
      await carregar();
      setFeedback({type:'ok', msg:'Imagem principal atualizada'});
    }catch(e){
      setFeedback({type:'err', msg:'Falha ao definir principal'});
    }
  }

  async function removerImagem(imagemId){
    if(!isAdmin) return;
    try{
      await api.delete(`/produtos/${id}/imagens/${imagemId}`);
      await carregar();
      setFeedback({type:'ok', msg:'Imagem removida'});
    }catch(e){
      setFeedback({type:'err', msg:'Falha ao remover imagem'});
    }
  }

  return (
    <div className="admin-layout">
      <MenuLateral />
      <div className="admin-main">
        <Header nome={"Edição de Produto"} />
        <div className="page-content">
          <div className="editar-produto-page">
          <div className="painel-imagens">
            <div className="card-imagens">
              <h2 style={{margin:'0 0 16px',fontSize:20}}>Imagens</h2>
              {produto?.imagens?.length ? (
                <>
                  <div className="imagem-item-large" style={{marginBottom:16}}>
                    <img src={imagemUrl(produto.imagens[0])} alt="principal" onError={e=>{e.target.src='/placeholder.svg';}} />
                    {produto.imagens[0].imagemPrincipal && <span className="principal-badge" style={{top:8,left:8}}>Principal</span>}
                  </div>
                  <div className="grid-thumbs" style={{marginBottom:20}}>
                    {produto.imagens.map(img=> (
                      <div key={img.id} className={"thumb "+(img.imagemPrincipal? 'principal':'')} onClick={()=>!img.imagemPrincipal && definirPrincipal(img.id)}>
                        <img src={imagemUrl(img)} alt="thumb" onError={e=>{e.target.src='/placeholder.svg';}} />
                        {img.imagemPrincipal && <span className="badge">Principal</span>}
                      </div>
                    ))}
                  </div>
                </>
              ): <div style={{fontSize:13,color:'#555'}}>Nenhuma imagem cadastrada.</div>}

              {isAdmin && (
                <div style={{marginTop:8}}>
                  <label style={{fontSize:13,fontWeight:600,display:'block',marginBottom:6}}>Adicionar novas</label>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} disabled={uploading} />
                  {novasImagens.length>0 && (
                    <div style={{marginTop:12}}>
                      <div className="grid-thumbs" style={{marginBottom:12}}>
                        {novasImagens.map((img,idx)=>(
                          <div key={idx} className={"thumb "+(principalUpload===idx? 'principal':'')}>
                            <img src={img.urlPreview} alt="preview" />
                            {principalUpload===idx && <span className="badge">Principal</span>}
                            <div className="acoes-thumb" style={{position:'absolute',bottom:4,left:4,right:4,display:'flex'}}>
                              <button className={principalUpload===idx? 'principal':''} type="button" onClick={()=>setPrincipalUpload(idx)}>Principal</button>
                              <button type="button" onClick={()=>{
                                setNovasImagens(list=>list.filter((_,i)=>i!==idx));
                                if(principalUpload===idx) setPrincipalUpload(null);
                              }}>Remover</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button type="button" className="btn-secondary btn-base" style={{padding:'10px 18px',fontSize:13}} onClick={()=>{setNovasImagens([]);setPrincipalUpload(null);}} disabled={saving || uploading}>Limpar Seleção</button>
                      <p style={{fontSize:11,color:'#555',marginTop:8}}>As imagens serão enviadas ao clicar em "Salvar Alterações".</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="card-form">
            <div className="form-header-edit" style={{maxWidth:'100%',paddingBottom:12,marginBottom:24}}>
              <h1 style={{fontSize:28}}>{isAdmin? 'Editar Produto' : 'Ajustar Estoque'}</h1>
              <div className="edit-top-actions">
                {isAdmin && (
                  <button type="button" className="btn-secondary btn-base" onClick={()=>navigate(`/visualizar-produto/${id}`)}>Visualizar</button>
                )}
                {isAdmin && produto && (
                  <button type="button" className={"btn-base "+(produto?.status? 'btn-danger':'btn-primary')} onClick={toggleStatus} disabled={saving}>
                    {produto?.status? 'Inativar':'Ativar'}
                  </button>
                )}
                <button type="button" className="btn-secondary btn-base" onClick={()=>navigate('/produtos')}>Voltar</button>
              </div>
            </div>
            <div className="meta-row">
              {produto && <><span className={"badge-status "+(produto?.status? 'ativo':'inativo')}>{produto?.status? 'Ativo':'Inativo'}</span>
              <span>ID: {produto?.id}</span>
              <span>Avaliação: {produto?.avaliacao || '-'}</span></>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Produto</label>
                <input name="nome" maxLength={200} value={form.nome} onChange={e=>{handleChange(e); if(errors.nome) setErrors(v=>({...v,nome:undefined}));}} onBlur={()=>setErrors(v=>({...v,...validateFields()}))} disabled={!isAdmin} className={!isAdmin? 'readonly':''} />
                {errors.nome && <span className="field-error">{errors.nome}</span>}
              </div>
              <div className="form-group">
                <label>Preço (R$)</label>
                <input name="preco" type="number" step="0.01" value={form.preco} onChange={e=>{handleChange(e); if(errors.preco) setErrors(v=>({...v,preco:undefined}));}} onBlur={()=>{
                  setForm(f=>({...f, preco: f.preco? Number(f.preco).toFixed(2):''}));
                  setErrors(v=>({...v,...validateFields()}));
                }} disabled={!isAdmin} className={!isAdmin? 'readonly':''} />
                {errors.preco && <span className="field-error">{errors.preco}</span>}
              </div>
              <div className="form-group">
                <label>Qtd. em Estoque</label>
                <input name="quantidadeEstoque" type="number" value={form.quantidadeEstoque} onChange={e=>{handleChange(e); if(errors.quantidadeEstoque) setErrors(v=>({...v,quantidadeEstoque:undefined}));}} onBlur={()=>setErrors(v=>({...v,...validateFields()}))} />
                {errors.quantidadeEstoque && <span className="field-error">{errors.quantidadeEstoque}</span>}
              </div>
              <div className="form-group">
                <label>Avaliação</label>
                <input name="avaliacao" type="number" step="0.5" min="1" max="5" value={form.avaliacao} onChange={e=>{handleChange(e); if(errors.avaliacao) setErrors(v=>({...v,avaliacao:undefined}));}} onBlur={()=>setErrors(v=>({...v,...validateFields()}))} disabled={!isAdmin} className={!isAdmin? 'readonly':''} />
                {errors.avaliacao && <span className="field-error">{errors.avaliacao}</span>}
              </div>
              <div className="form-group full-width">
                <label>Descrição Detalhada</label>
                <textarea name="descricao" maxLength={2000} rows={5} value={form.descricao} onChange={e=>{handleChange(e); if(errors.descricao) setErrors(v=>({...v,descricao:undefined}));}} onBlur={()=>setErrors(v=>({...v,...validateFields()}))} disabled={!isAdmin} className={!isAdmin? 'readonly':''} />
                {errors.descricao && <span className="field-error">{errors.descricao}</span>}
              </div>
            </div>

            {feedback && <div className={"feedback "+(feedback.type==='ok'?'ok':'err')}>{feedback.msg}</div>}
            <div className="form-actions-edit" style={{marginTop:48}}>
              <button type="button" className="btn-primary btn-base" disabled={saving || uploading} onClick={salvar}>{(saving||uploading)? 'Salvando...':'Salvar Alterações'}</button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
