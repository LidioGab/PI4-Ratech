import { createContext, useContext, useState, useEffect } from 'react';
import { calculateShipping, calculateTotal } from '../utils/cart';
import api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('padrao');
  const [currentUser, setCurrentUser] = useState(null);

  // Verificar usuário logado
  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem('sessionUser');
      const clienteSession = localStorage.getItem('clienteSession');
      
      if (stored) {
        try { 
          setCurrentUser(JSON.parse(stored)); 
        } catch {}
      } else if (clienteSession) {
        try { 
          setCurrentUser(JSON.parse(clienteSession)); 
        } catch {}
      } else {
        setCurrentUser(null);
      }
    };
    
    checkUser();
    // Escutar mudanças no localStorage
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  // Carregar carrinho quando usuário mudar
  useEffect(() => {
    if (currentUser?.id) {
      loadCartFromServer();
    } else {
      loadCartFromLocalStorage();
    }
  }, [currentUser]);

  // Carregar do servidor (usuário logado)
  const loadCartFromServer = async () => {
    // Verificar se o usuário está logado e tem ID válido
    if (!currentUser?.id) {
      console.log('Usuário não logado, carregando do localStorage');
      loadCartFromLocalStorage();
      return;
    }

    try {
      const response = await api.get(`/api/carrinho/${currentUser.id}`);
      const serverItems = response.data;
      
      // Converter para formato do frontend
      const formattedItems = serverItems.map(item => ({
        id: item.produto.id,
        nome: item.produto.nome,
        preco: item.produto.preco,
        quantidade: item.quantidade,
        imagem: item.produto.imagens?.[0] || null,
        quantidadeEstoque: item.produto.quantidadeEstoque
      }));
      
      setCartItems(formattedItems);
      
      // Sincronizar com localStorage também
      localStorage.setItem('ratechCart', JSON.stringify(formattedItems));
    } catch (error) {
      console.error('Erro ao carregar carrinho do servidor:', error);
      // Fallback para localStorage se houver erro
      loadCartFromLocalStorage();
    }
  };

  // Carregar do localStorage (usuário não logado)
  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem('ratechCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Erro ao carregar carrinho do localStorage:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  };

  // Sincronizar com servidor se usuário estiver logado
  const syncWithServer = async (action, data) => {
    if (!currentUser?.id) return;
    
    try {
      switch (action) {
        case 'add':
          await api.post('/api/carrinho/adicionar', {
            clienteId: currentUser.id,
            produtoId: data.produtoId,
            quantidade: data.quantidade
          });
          break;
        case 'update':
          await api.put(`/api/carrinho/${currentUser.id}/item/${data.produtoId}`, {
            quantidade: data.quantidade
          });
          break;
        case 'remove':
          await api.delete(`/api/carrinho/${currentUser.id}/item/${data.produtoId}`);
          break;
        case 'clear':
          await api.delete(`/api/carrinho/${currentUser.id}`);
          break;
      }
    } catch (error) {
      console.error('Erro ao sincronizar com servidor:', error);
    }
  };

  // Adicionar produto ao carrinho
  async function addToCart(produto, quantidade = 1) {
    // Atualizar estado local primeiro (UX responsivo)
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === produto.id);
      
      let newItems;
      if (existingItem) {
        // Se já existe, atualiza a quantidade
        newItems = prevItems.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        );
      } else {
        // Se não existe, adiciona novo item
        newItems = [...prevItems, {
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: quantidade,
          imagem: produto.imagens?.[0] || null,
          quantidadeEstoque: produto.quantidadeEstoque
        }];
      }
      
      // Salvar no localStorage imediatamente
      localStorage.setItem('ratechCart', JSON.stringify(newItems));
      return newItems;
    });

    // Sincronizar com servidor se usuário estiver logado
    await syncWithServer('add', { produtoId: produto.id, quantidade });
  }

  // Remover produto do carrinho
  async function removeFromCart(produtoId) {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== produtoId);
      localStorage.setItem('ratechCart', JSON.stringify(newItems));
      return newItems;
    });

    await syncWithServer('remove', { produtoId });
  }

  // Atualizar quantidade de um item
  async function updateQuantity(produtoId, novaQuantidade) {
    if (novaQuantidade <= 0) {
      await removeFromCart(produtoId);
      return;
    }

    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === produtoId
          ? { ...item, quantidade: novaQuantidade }
          : item
      );
      localStorage.setItem('ratechCart', JSON.stringify(newItems));
      return newItems;
    });

    await syncWithServer('update', { produtoId, quantidade: novaQuantidade });
  }

  // Limpar carrinho
  async function clearCart() {
    setCartItems([]);
    localStorage.removeItem('ratechCart');
    await syncWithServer('clear', {});
  }

  // Migrar carrinho do localStorage para o servidor quando usuario faz login
  async function migrateCartToServer(userId) {
    if (!userId || cartItems.length === 0) return;
    
    try {
      // Adicionar cada item do carrinho local no servidor
      for (const item of cartItems) {
        await api.post('/api/carrinho/adicionar', {
          clienteId: userId,
          produtoId: item.id,
          quantidade: item.quantidade
        });
      }
      
      // Recarregar carrinho do servidor para sincronizar
      await loadCartFromServer();
    } catch (error) {
      console.error('Erro ao migrar carrinho para servidor:', error);
    }
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
    cart: cartItems, // Alias para compatibilidade
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
    getShippingInfo,
    getTotal,
    total: getTotal(), // Alias para compatibilidade
    setShippingType,
    selectedShipping,
    isInCart,
    getItemQuantity,
    isCartOpen,
    toggleCart,
    openCart,
    closeCart,
    migrateCartToServer,
    loadCartFromServer
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

// Exportar o contexto também para uso direto
export { CartContext };
