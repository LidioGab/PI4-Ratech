import './index.css';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import HeaderPesquisa from '../../../components/headerPesquisa';
import CardMelhoresAvaliados from '../../../components/cardMelhoresAvaliados';

export default function ListarProdutosFrontoffice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [ordenacao, setOrdenacao] = useState('mais-procurados');
  const [itensPorPagina, setItensPorPagina] = useState(20);
  const [visualizacao, setVisualizacao] = useState('grid');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    buscarProdutos();
  }, [page, query, ordenacao, itensPorPagina]);

  useEffect(() => {
    if (page !== 0) {
      setPage(0);
    }
  }, [query, ordenacao, itensPorPagina]);

  async function buscarProdutos() {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', itensPorPagina);
      params.append('status', true);
      
      if (query) {
        params.append('q', query);
      }
      switch (ordenacao) {
        case 'menor-preco':
          params.append('sort', 'preco,asc');
          break;
        case 'maior-preco':
          params.append('sort', 'preco,desc');
          break;
        case 'maior-avaliacao':
          params.append('sort', 'avaliacao,desc');
          break;
        case 'mais-recentes':
          params.append('sort', 'dataCriacao,desc');
          break;
        case 'nome-az':
          params.append('sort', 'nome,asc');
          break;
        default:
          params.append('sort', 'avaliacao,desc');
          break;
      }

      console.log('Buscando produtos com parâmetros:', params.toString());
      const response = await api.get(`/api/produtos?${params.toString()}`);
      const data = response.data;
      
      console.log('Resposta da API:', data);
      
      if (data.content) {
        setProdutos(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setProdutos(data || []);
        setTotalPages(1);
        setTotalElements(data?.length || 0);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError('Erro ao carregar produtos. Verifique se o servidor backend está rodando.');
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }



  if (loading) {
    return (
      <div className="frontoffice-layout">
        <HeaderPesquisa />
        <div className="produtos-container">
          <div className="loading-produtos">
            <div className="spinner"></div>
            <p>Carregando produtos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="frontoffice-layout">
        <HeaderPesquisa />
        <div className="produtos-container">
          <div className="error-produtos">
            <p>{error}</p>
            <button onClick={buscarProdutos} className="retry-btn">
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="frontoffice-layout">
      <HeaderPesquisa />
      
      <div className="produtos-container">
        <div className="produtos-header">
          <div className="filtros-container">
            <div className="filtro-group">
              <label>Ordenar:</label>
              <select 
                value={ordenacao} 
                onChange={(e) => setOrdenacao(e.target.value)}
                className="filtro-select"
              >
                <option value="mais-procurados">Mais procurados</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
                <option value="maior-avaliacao">Maior avaliação</option>
                <option value="mais-recentes">Mais recentes</option>
                <option value="nome-az">Nome A-Z</option>
              </select>
            </div>

            <div className="filtro-group">
              <label>Exibir:</label>
              <select 
                value={itensPorPagina} 
                onChange={(e) => setItensPorPagina(Number(e.target.value))}
                className="filtro-select"
              >
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={40}>40 por página</option>
                <option value={60}>60 por página</option>
              </select>
            </div>

            <div className="resultados-info">
              <span>{totalElements} produtos</span>
            </div>
          </div>

          <div className="view-controls">
            <button 
              className={`view-btn ${visualizacao === 'list' ? 'active' : ''}`}
              onClick={() => setVisualizacao('list')}
              aria-label="Visualização em lista"
            >
              ☰
            </button>
            <button 
              className={`view-btn ${visualizacao === 'grid' ? 'active' : ''}`}
              onClick={() => setVisualizacao('grid')}
              aria-label="Visualização em grade"
            >
              ⋮⋮⋮
            </button>
          </div>
        </div>

        {query && (
          <div className="search-title">
            <h1>Resultados para "{query}"</h1>
            <p>{totalElements} produto{totalElements !== 1 ? 's' : ''} encontrado{totalElements !== 1 ? 's' : ''}</p>
          </div>
        )}

        {produtos.length > 0 ? (
          <div className={`produtos-grid ${visualizacao}`}>
            {produtos.map((produto) => (
              <CardMelhoresAvaliados key={produto.id} produto={produto} />
            ))}
          </div>
        ) : (
          <div className="no-produtos">
            <h2>Nenhum produto encontrado</h2>
            <p>Tente ajustar seus filtros ou fazer uma nova busca.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="pagination-btn"
            >
              ← Anterior
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`pagination-page ${page === pageNum ? 'active' : ''}`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="pagination-btn"
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
