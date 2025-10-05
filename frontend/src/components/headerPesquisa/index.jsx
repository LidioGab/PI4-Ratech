import './index.css'
import logoImage from '../../assets/images/logoRatechNome.png';
import lupaPng from '../../assets/images/lupa.png'
import carrinho from '../../assets/images/carrinho.png'
import conta from '../../assets/images/conta.png'

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function HeaderPesquisa(){
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [termoBusca, setTermoBusca] = useState(searchParams.get('q') || '');

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
        <button className='icon-btn'>
          <img src={conta} alt="Minha conta" />
        </button>
        <button className='icon-btn'>
          <img src={carrinho} alt="Carrinho" />
        </button>
      </div>
    </div>
  )
}
