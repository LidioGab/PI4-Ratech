import './index.css';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/cart';
import FreteCalculator from '../FreteCalculator';
import api from '../../services/api';
import placeholder from '../../assets/images/product-placeholder.svg';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function MenuLateralCarrinho() {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    getSubtotal,
    getShippingInfo,
    getTotal,
    getTotalItems,
    clearCart 
  } = useCart();
  
  const { user } = useAuth();
  const navigate = useNavigate();

  function buildImageSrc(img) {
    if (!img) return placeholder;
    const baseURL = api.defaults.baseURL?.replace(/\/$/, '') || '';
    const path = (img.diretorio || '') + img.nomeArquivo;
    if (/^https?:/i.test(path)) return path;
    return baseURL + (path.startsWith('/') ? path : '/' + path);
  }

  function handleImageError(ev) {
    ev.currentTarget.src = placeholder;
  }

  function handleQuantityChange(itemId, newQuantity) {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  }

  function handleRemoveItem(itemId) {
    removeFromCart(itemId);
  }

  function handleClearCart() {
    if (window.confirm('Deseja realmente limpar todo o carrinho?')) {
      clearCart();
    }
  }

  function handleCheckout() {
    // Verificar se usuário está logado - IGUAL ao perfil cliente
    const cliente = localStorage.getItem('clienteSession');
    if (!cliente) {
      // Salvar rota de retorno e redirecionar para login
      localStorage.setItem('redirectAfterLogin', '/checkout');
      closeCart();
      navigate('/login');
    } else {
      try {
        const clienteData = JSON.parse(cliente);
        if (!clienteData || !clienteData.id) {
          closeCart();
          navigate('/login');
          return;
        }
        // Usuário logado, ir direto para checkout
        closeCart();
        navigate('/checkout');
      } catch (error) {
        console.error('Erro ao parsear sessão do cliente:', error);
        closeCart();
        navigate('/login');
      }
    }
  }

  const subtotal = getSubtotal();
  const shippingInfo = getShippingInfo();
  const total = getTotal();
  const totalItems = getTotalItems();

  return (
    <>
      {/* Overlay */}
      <div 
        className={`cart-overlay ${isCartOpen ? 'active' : ''}`}
        onClick={closeCart}
      />
      
      {/* Menu Lateral */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Meu Carrinho</h2>
          <button className="close-btn" onClick={closeCart}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17A2 2 0 0119 19A2 2 0 0117 21A2 2 0 0115 19A2 2 0 0117 17M9 19A2 2 0 0111 21A2 2 0 019 23A2 2 0 017 21A2 2 0 019 19Z" 
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Seu carrinho está vazio</h3>
              <p>Adicione produtos para começar suas compras!</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img 
                        src={buildImageSrc(item.imagem)} 
                        onError={handleImageError}
                        alt={item.nome} 
                      />
                    </div>
                    
                    <div className="item-details">
                      <h4 className="item-name">{item.nome}</h4>
                      <p className="item-price">{formatCurrency(item.preco)}</p>
                      
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantidade - 1)}
                          disabled={item.quantidade <= 1}
                        >
                          −
                        </button>
                        <span className="quantity">{item.quantidade}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantidade + 1)}
                          disabled={item.quantidade >= item.quantidadeEstoque}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="item-total">
                        Total: {formatCurrency(item.preco * item.quantidade)}
                      </div>
                    </div>

                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remover item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
               
                <div className="frete-calculator-cart">
                  <FreteCalculator showSubtotal={true} />
                </div>

                <div className="cart-actions">
                  <button 
                    className="clear-btn"
                    onClick={handleClearCart}
                  >
                    Limpar Carrinho
                  </button>
                  <button 
                    className="checkout-btn"
                    onClick={handleCheckout}
                  >
                    Finalizar Compra
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
