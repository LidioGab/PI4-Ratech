import { createContext, useContext, useState, useEffect } from 'react';
import { calculateShipping, calculateTotal } from '../utils/cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('padrao');

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    const savedCart = localStorage.getItem('ratechCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Erro ao carregar carrinho do localStorage:', error);
      }
    }
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('ratechCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Adicionar produto ao carrinho
  function addToCart(produto, quantidade = 1) {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === produto.id);
      
      if (existingItem) {
        // Se já existe, atualiza a quantidade
        return prevItems.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        );
      } else {
        // Se não existe, adiciona novo item
        return [...prevItems, {
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: quantidade,
          imagem: produto.imagens?.[0] || null,
          quantidadeEstoque: produto.quantidadeEstoque
        }];
      }
    });
  }

  // Remover produto do carrinho
  function removeFromCart(produtoId) {
    setCartItems(prevItems => prevItems.filter(item => item.id !== produtoId));
  }

  // Atualizar quantidade de um item
  function updateQuantity(produtoId, novaQuantidade) {
    if (novaQuantidade <= 0) {
      removeFromCart(produtoId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === produtoId
          ? { ...item, quantidade: novaQuantidade }
          : item
      )
    );
  }

  // Limpar carrinho
  function clearCart() {
    setCartItems([]);
  }

  // Calcular total de itens
  function getTotalItems() {
    return cartItems.reduce((total, item) => total + item.quantidade, 0);
  }

  // Calcular subtotal
  function getSubtotal() {
    return cartItems.reduce((total, item) => {
      const preco = typeof item.preco === 'number' ? item.preco : parseFloat(item.preco) || 0;
      return total + (preco * item.quantidade);
    }, 0);
  }

  // Verificar se produto está no carrinho
  function isInCart(produtoId) {
    return cartItems.some(item => item.id === produtoId);
  }

  // Obter quantidade de um produto específico no carrinho
  function getItemQuantity(produtoId) {
    const item = cartItems.find(item => item.id === produtoId);
    return item?.quantidade || 0;
  }

  // Calcular informações de frete
  function getShippingInfo() {
    const subtotal = getSubtotal();
    return calculateShipping(subtotal, selectedShipping);
  }

  // Calcular total final (subtotal + frete)
  function getTotal() {
    const subtotal = getSubtotal();
    const shipping = getShippingInfo();
    return calculateTotal(subtotal, shipping.valor);
  }

  // Alterar tipo de frete
  function setShippingType(tipo) {
    setSelectedShipping(tipo);
  }

  // Abrir/fechar carrinho
  function toggleCart() {
    setIsCartOpen(!isCartOpen);
  }

  function openCart() {
    setIsCartOpen(true);
  }

  function closeCart() {
    setIsCartOpen(false);
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
    getShippingInfo,
    getTotal,
    setShippingType,
    selectedShipping,
    isInCart,
    getItemQuantity,
    isCartOpen,
    toggleCart,
    openCart,
    closeCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}