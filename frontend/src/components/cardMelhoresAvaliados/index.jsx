import './index.css'
import api from '../../services/api'
import placeholder from '../../assets/images/product-placeholder.svg'

export default function melhoresAvaliados({produto}) {
  const { nome, avaliacao, descricao, imagens, preco } = produto;
  
  const baseURL = api.defaults.baseURL?.replace(/\/$/,'') || '';
  
  function buildSrc(img){
    if(!img) return placeholder;
    const path = (img.diretorio || '') + img.nomeArquivo;
    if(/^https?:/i.test(path)) return path;
    return baseURL + (path.startsWith('/')? path : '/' + path);
  }
  
  function handleImgError(ev){ 
    ev.currentTarget.src = placeholder; 
  }
  
  const primeiraImagem = Array.isArray(imagens) && imagens.length > 0 
    ? (imagens.find(i => i.imagemPrincipal) || imagens[0])
    : null;

  return (
    <section className="card-melhoresAvaliados">
      <div className="card-img-wrapper">
        <img 
          src={buildSrc(primeiraImagem)} 
          onError={handleImgError} 
          alt={nome} 
        />
      </div>
      <div className="card-info">
        <h2 className="card-title">{nome}</h2>
        <p className="card-desc">{descricao}</p>
        <div className="card-bottom">
          <div className="card-price-rating">
            <span className="card-preco">R$ {preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            <span className="card-avaliacao">
              <span>⭐</span>
              <span>{avaliacao}</span>
            </span>
          </div>
          <button 
            className="card-add-to-cart"
            onClick={() => console.log('Adicionar ao carrinho:', produto.id)}
            aria-label={`Adicionar ${nome} ao carrinho`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17A2 2 0 0119 19A2 2 0 0117 21A2 2 0 0115 19A2 2 0 0117 17M9 19A2 2 0 0111 21A2 2 0 019 23A2 2 0 017 21A2 2 0 019 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Adicionar
          </button>
        </div>
      </div>
    </section>
  );
}
