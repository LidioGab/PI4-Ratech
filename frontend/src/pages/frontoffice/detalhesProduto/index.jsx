import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import HeaderPesquisa from '../../../components/headerPesquisa';
import { useCart } from '../../../context/CartContext';
import FreteCalculator from '../../../components/FreteCalculator';
import api from '../../../services/api';
import placeholder from '../../../assets/images/product-placeholder.svg';
import './index.css';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, isInCart, getItemQuantity, openCart } = useCart();
  
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const baseURL = api.defaults.baseURL?.replace(/\/$/,'') || '';

  useEffect(() => {
    buscarProduto();
  }, [id]);

  async function buscarProduto() {
    try {
      setLoading(true);
      const response = await api.get(`/api/produtos/${id}`);
      setProduto(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      setError('Produto não encontrado');
    } finally {
      setLoading(false);
    }
  }

  function buildSrc(img) {
    if (!img) return placeholder;
    const path = (img.diretorio || '') + img.nomeArquivo;
    if (/^https?:/i.test(path)) return path;
    return baseURL + (path.startsWith('/') ? path : '/' + path);
  }

  function handleImgError(ev) {
    ev.currentTarget.src = placeholder;
  }

  function handleDecrement() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  function handleIncrement() {
    const quantidadeNoCarrinho = getItemQuantity(produto.id);
    const estoqueDisponivel = produto.quantidadeEstoque - quantidadeNoCarrinho;
    
    if (quantity < estoqueDisponivel) {
      setQuantity(quantity + 1);
    }
  }

  function handlePrevImage() {
    const images = produto?.imagens || [];
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }

  function handleNextImage() {
    const images = produto?.imagens || [];
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }

  function handleAddToCart() {
    if (!produto?.quantidadeEstoque || produto.quantidadeEstoque <= 0) {
      alert('Produto fora de estoque');
      return;
    }
    
    const quantidadeNoCarrinho = getItemQuantity(produto.id);
    const estoqueDisponivel = produto.quantidadeEstoque - quantidadeNoCarrinho;
    
    if (quantidadeNoCarrinho >= produto.quantidadeEstoque) {
      alert('Quantidade máxima em estoque já adicionada ao carrinho');
      return;
    }
    
    if (quantity > estoqueDisponivel) {
      alert(`Apenas ${estoqueDisponivel} unidades disponíveis para adicionar ao carrinho`);
      return;
    }
    
    addToCart(produto, quantity);
    openCart();
  }

  if (loading) {
    return (
      <div className="product-page">
        <HeaderPesquisa />
        <div className="product-container">
          <div className="loading">Carregando produto...</div>
        </div>
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className="product-page">
        <HeaderPesquisa />
        <div className="product-container">
          <div className="error">Produto não encontrado</div>
        </div>
      </div>
    );
  }

  const images = produto.imagens || [];
  const primeiraImagem = images.length > 0 
    ? (images.find(i => i.imagemPrincipal) || images[0])
    : null;
  const quantidadeNoCarrinho = getItemQuantity(produto.id);

  return (
    <div className="product-page">
      <HeaderPesquisa />
      <div className="product-container">
        <div className="product-content">
          <div className="product-section">
            <div className="main-image">
              <img 
                src={buildSrc(images[currentImageIndex] || primeiraImagem)} 
                onError={handleImgError}
                alt={produto.nome}
              />
            </div>

            {images.length > 1 && (
              <div className="thumbnail-section">
                <button className="thumbnail-nav" onClick={handlePrevImage}>‹</button>
                <div className="thumbnails">
                  {images.map((img, index) => (
                    <div
                      key={img.id || index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img 
                        src={buildSrc(img)} 
                        onError={handleImgError}
                        alt={`${produto.nome} - ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <button className="thumbnail-nav" onClick={handleNextImage}>›</button>
              </div>
            )}
          </div>

          <div className="info-section">
            <h1 className="product-title">{produto.nome}</h1>
            
            <div className="rating">
              <span className="stars">★★★★★</span>
              <span className="review-count">({produto.avaliacao || '5.0'})</span>
            </div>

            <div className="price">R$ {produto.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>

            <p className="description">
              {produto.descricao || 'Descrição não disponível.'}
            </p>

            {produto.quantidadeEstoque > 0 ? (
              <>
                <div className="stock-info">
                  <span className="stock-available">✓ {produto.quantidadeEstoque} unidades em estoque</span>
                  {quantidadeNoCarrinho > 0 && (
                    <span className="cart-info">({quantidadeNoCarrinho} no carrinho)</span>
                  )}
                  {quantidadeNoCarrinho > 0 && (
                    <span className="available-info">
                      • {produto.quantidadeEstoque - quantidadeNoCarrinho} disponíveis para adicionar
                    </span>
                  )}
                </div>

                <div className="quantity-section">
                  <button 
                    className="quantity-btn" 
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button 
                    className="quantity-btn" 
                    onClick={handleIncrement}
                    disabled={quantity >= (produto.quantidadeEstoque - quantidadeNoCarrinho)}
                  >
                    +
                  </button>
                </div>

                <div className="frete-section">
                  <FreteCalculator />
                </div>

                <button 
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={quantidadeNoCarrinho >= produto.quantidadeEstoque}
                >
                  {quantidadeNoCarrinho >= produto.quantidadeEstoque 
                    ? 'Estoque máximo no carrinho' 
                    : 'Adicionar ao Carrinho'
                  }
                </button>
              </>
            ) : (
              <div className="out-of-stock">
                <span className="stock-unavailable">✗ Produto fora de estoque</span>
                <button className="add-to-cart-btn" disabled>
                  Indisponível
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
