import './index.css'
import HeaderPesquisa from '../../../components/headerPesquisa'
import PropMelhoresAvaliados from '../../../components/cardMelhoresAvaliados';
import Carousel from '../../../components/carrosel';
import api from '../../../services/api.js'
import { useEffect, useState } from 'react';


export default function PaginaInicial(){
  let [produtos, setProdutos] = useState([]);

  async function buscarProdutos() {
    try {
      const response = await api.get("/api/produtos/todos")
      console.log(response.data)
      setProdutos(response.data)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      console.log('Verifique se o servidor backend está rodando em http://localhost:8080')
    }
  }

  const melhoresAvaliados = [...produtos]
    .sort((a, b) => b.avaliacao - a.avaliacao)
    .slice(0, 10)

  useEffect(()=>{
    document.title = "Ratech | Pagina inicial"
    buscarProdutos()
  }, [])


  const chunkSize = 5;
  const cardChunks = [];
  for (let i = 0; i < melhoresAvaliados.length; i += chunkSize) {
    const chunk = melhoresAvaliados.slice(i, i + chunkSize);
    while (chunk.length < chunkSize && cardChunks.length === 0) {
      break;
    }
    if (chunk.length > 0) {
      cardChunks.push(chunk);
    }
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
