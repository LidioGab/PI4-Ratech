import './index.css'
import logoImage from '../../assets/images/logoRatechNome.png';
import lupaPng from '../../assets/images/lupa.png'
import carrinho from '../../assets/images/carrinho.png'
import conta from '../../assets/images/conta.png'

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function HeaderPesquisa(){
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [termoBusca, setTermoBusca] = useState(searchParams.get('q') || '');
  const [clienteLogado, setClienteLogado] = useState(null);
  const [menuLateralAberto, setMenuLateralAberto] = useState(false);
  const { getTotalItems, toggleCart } = useCart();

  // Verificar se o cliente está logado
  useEffect(() => {
    const cliente = localStorage.getItem('clienteSession');
    if (cliente) {
      try {
        setClienteLogado(JSON.parse(cliente));
      } catch (error) {
        console.error('Erro ao parsear sessão do cliente:', error);
        localStorage.removeItem('clienteSession');
      }
    }
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (termoBusca.trim()) {
      navigate(`/produtos-loja?q=${encodeURIComponent(termoBusca.trim())}`);
    } else {
      navigate('/produtos-loja');
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  }

  function handleLogout() {
    localStorage.removeItem('clienteSession');
    setClienteLogado(null);
    setMenuLateralAberto(false);
    navigate('/');
  }

  function toggleMenuLateral() {
    setMenuLateralAberto(!menuLateralAberto);
  }

  function handleOverlayClick() {
    setMenuLateralAberto(false);
  }

  function handleMenuClick(e) {
    e.stopPropagation();
  }

  const totalItems = getTotalItems();

  return(
    <div className='pag-headerPesquisa'>
      <div className='logo-container'>
        <Link to="/">
          <img src={logoImage} alt="Ratech" />
        </Link>
      </div>

      <form className='pesquisa' onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Buscar produtos..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button type="submit" className="search-btn">
          <img src={lupaPng} alt="Buscar" />
        </button>
      </form>

      <div className='account-carrinho'>
        <button className='icon-btn account-btn' onClick={toggleMenuLateral}>
          <img src={conta} alt="Minha conta" />
        </button>
        <button className='icon-btn cart-btn' onClick={toggleCart}>
          <img src={carrinho} alt="Carrinho" />
          {totalItems > 0 && (
            <span className='cart-badge'>{totalItems}</span>
          )}
        </button>
      </div>

      {/* Overlay do menu lateral */}
      {menuLateralAberto && (
        <div className='menu-overlay' onClick={handleOverlayClick}>
          <div className='menu-lateral-conta' onClick={handleMenuClick}>
            <div className='menu-header'>
              <h3>Minha Conta</h3>
              <button className='close-btn' onClick={() => setMenuLateralAberto(false)}>
                ×
              </button>
            </div>
            
            <div className='menu-content'>
              {clienteLogado ? (
                // Cliente logado
                <>
                  <div className='user-info'>
                    <div className='user-avatar'>
                      {clienteLogado.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className='user-details'>
                      <h4>{clienteLogado.nome}</h4>
                      <p>{clienteLogado.email}</p>
                    </div>
                  </div>
                  
                  <div className='menu-options'>
                    <Link to="/perfil-cliente" className='menu-option' onClick={() => setMenuLateralAberto(false)}>
                      <span>👤</span>
                      Alterar Dados do Cliente
                    </Link>
                    <Link to="/meus-pedidos" className='menu-option' onClick={() => setMenuLateralAberto(false)}>
                      <span>📋</span>
                      Meus Pedidos
                    </Link>
                    <button className='menu-option logout-option' onClick={handleLogout}>
                      <span>🚪</span>
                      Sair
                    </button>
                  </div>
                </>
              ) : (
                // Cliente não logado
                <div className='login-options'>
                  <h4>Acesse sua conta</h4>
                  <Link to="/login" className='menu-btn login-btn' onClick={() => setMenuLateralAberto(false)}>
                    Fazer Login
                  </Link>
                  <p className='signup-text'>
                    Não tem conta? 
                    <Link to="/cadastro-cliente" className='signup-link' onClick={() => setMenuLateralAberto(false)}>
                      Criar conta
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
