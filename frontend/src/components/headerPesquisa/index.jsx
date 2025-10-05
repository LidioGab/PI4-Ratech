import './index.css'
import logoImage from '../../assets/images/logoRatechNome.png';
import lupaPng from '../../assets/images/lupa.png'
import carrinho from '../../assets/images/carrinho.png'
import conta from '../../assets/images/conta.png'

import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HeaderPesquisa(){

  return(
    <div className='pag-headerPesquisa'>
      <div>
        <img src={logoImage} alt="" />
        <Link to="/"></Link>
      </div>

      <div className='pesquisa'>
        <input type="text" />
        <img src={lupaPng} alt="" />
      </div>

      <div className='account-carrinho'>
        <img src={conta} alt="" />
        <img src={carrinho} alt="" />
      </div>
    </div>
  )
}
