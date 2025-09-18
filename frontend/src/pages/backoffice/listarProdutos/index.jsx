import './index.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';
import { useAuth } from '../../../context/AuthContext.jsx';

export default function ListarProdutos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState({open:false, id:null, atual:false});
  useEffect(() => { buscarProdutos(); }, [page, query]);

  async function buscarProdutos() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
  params.append('size', PAGE_SIZE);
      if (query) params.append('q', query);
      const response = await api.get(`/produtos?${params.toString()}`);
      const data = response.data;
      setProdutos(data.content || []);
      setTotalPages(data.totalPages || 0);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id) {
    try {
      await api.put(`/produtos/${id}/status`);
      setConfirmStatus({open:false, id:null, atual:false});
      buscarProdutos();
    } catch (e) {
      alert('Falha ao alterar status do produto');
    }
  }

  function openStatusModal(p){
    setConfirmStatus({open:true, id:p.id, atual:p.status});
  }

  function handleSearchSubmit(e){
    e.preventDefault();
    setPage(0);
    setQuery(searchInput.trim());
  }

  function clearSearch(){
    setSearchInput('');
    setQuery('');
    setPage(0);
  }

  if (loading) {
    return (
      <div className="produtos-page">
        <h1>Carregando produtos...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="produtos-page">
        <h1>Lista de Produtos</h1>
        <div className="error-message">{error}</div>
        <button onClick={buscarProdutos} className="retry-btn">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <MenuLateral />
      <div className="admin-content">
        <Header nome={"Gerenciamento de Produtos"} />
        <div className="produtos-page">
          <div className="produtos-header">
            <h1>Lista de Produtos</h1>
            <div className="header-actions">
              <form onSubmit={handleSearchSubmit} style={{display:'flex', gap:8}}>
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchInput}
                  onChange={e=>setSearchInput(e.target.value)}
                  style={{padding:'10px 14px', border:'2px solid #e5e7eb', borderRadius:8}}
                />
                <button type="submit" className="refresh-btn">Buscar</button>
                {query && <button type="button" onClick={clearSearch} className="retry-btn">Limpar</button>}
              </form>
              {user?.grupo === 'Administrador' && (
                <button onClick={() => navigate('/criar-produto')} className="create-btn">
                  + Criar Produto
                </button>
              )}
            </div>
          </div>

          <div className="produtos-table-container">
            <table className="produtos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Estoque</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th>Opções</th>
                </tr>
              </thead>
              <tbody>
                {produtos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : (
                  produtos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.nome}</td>
                      <td>{p.quantidadeEstoque}</td>
                      <td>R$ {Number(p.preco).toFixed(2)}</td>
                      <td>{p.status ? 'Ativo' : 'Inativo'}</td>
                      <td>
                        <div className="action-buttons">
                          {(user?.grupo === 'Administrador' || user?.grupo === 'Estoquista') && (
                            <button className="edit-btn" onClick={() => navigate(`/editar-produto/${p.id}`)}>Editar</button>
                          )}
                          {user?.grupo === 'Administrador' && (
                            <button className="view-btn" onClick={() => navigate(`/visualizar-produto/${p.id}`)}>Visualizar</button>
                          )}
                          {user?.grupo === 'Administrador' && (
                            <button className={p.status ? 'active-btn' : 'inactive-btn'} onClick={() => openStatusModal(p)}>
                              {p.status ? 'Ativo' : 'Inativo'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{display:'flex', justifyContent:'flex-start', marginTop:16, alignItems:'center', gap:8}}>
              <button disabled={page===0} onClick={()=>setPage(p=>p-1)} className="refresh-btn">Prev</button>
              <span style={{alignSelf:'center'}}>Página {page+1} de {totalPages}</span>
              <button disabled={page+1>=totalPages} onClick={()=>setPage(p=>p+1)} className="refresh-btn">Next</button>
            </div>
          )}
          {confirmStatus.open && (
            <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000}}>
              <div style={{background:'#fff', padding:24, borderRadius:12, width:360, boxShadow:'0 8px 32px rgba(0,0,0,.15)'}}>
                <h3 style={{marginTop:0, marginBottom:12}}>Confirmar alteração de status</h3>
                <p style={{marginTop:0}}>Deseja realmente {confirmStatus.atual ? 'inativar' : 'ativar'} este produto?</p>
                <div style={{display:'flex', justifyContent:'flex-end', gap:12, marginTop:24}}>
                  <button className="retry-btn" onClick={()=>setConfirmStatus({open:false,id:null,atual:false})}>Cancelar</button>
                  <button className={confirmStatus.atual? 'inactive-btn':'active-btn'} onClick={()=>toggleStatus(confirmStatus.id)}>
                    {confirmStatus.atual ? 'Inativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
