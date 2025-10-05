import './index.css'
import HeaderPesquisa from '../../../components/headerPesquisa'
import PropMelhoresAvaliados from '../../../components/cardMelhoresAvaliados';
import Carousel from '../../../components/carrosel';
import api from '../../../services/api.js'
import { useEffect, useState } from 'react';


export default function PaginaInicial(){
  let [produtos, setProdutos] = useState([]);

  async function buscarProdutos() {
    const response = await api.get("/produtos/todos")
    console.log(response.data)
    setProdutos(response.data)
  }

  const melhoresAvaliados = [...produtos]
    .sort((a, b) => b.avaliacao - a.avaliacao)
    .slice(0, 10)

  useEffect(()=>{
    buscarProdutos()
  }, [])


  // Divide os produtos em "páginas" de 5 cards
  const chunkSize = 5;
  const cardChunks = [];
  for (let i = 0; i < melhoresAvaliados.length; i += chunkSize) {
    cardChunks.push(melhoresAvaliados.slice(i, i + chunkSize));
  }

  return(
    <div className='paginaInicial'>
      <HeaderPesquisa/>
      <div className='melhoresAvaliados'>
        <h1>Melhores Avaliados</h1>
        <Carousel>
          {cardChunks.map((chunk, idx) => (
            <div className="carousel-slide" key={idx}>
              {chunk.map((produto) => (
                <PropMelhoresAvaliados key={produto.id} produto={produto}/>
              ))}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  )
}
