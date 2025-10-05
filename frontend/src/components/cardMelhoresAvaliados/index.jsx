import './index.css'

export default function melhoresAvaliados({produto}) {
  const { nome, avaliacao, descricao, imagens, preco } = produto;
  // Pega a primeira imagem válida
  const imagemUrl = Array.isArray(imagens) && imagens.length > 0 ? imagens[0].url || imagens[0] : '';

  return (
    <section className="card-melhoresAvaliados">
      <div className="card-img-wrapper">
        <img src={imagemUrl} alt={nome} />
      </div>
      <div className="card-info">
        <h2 className="card-title">{nome}</h2>
        <p className="card-desc">{descricao}</p>
        <div className="card-bottom">
          <span className="card-preco">R$ {preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
          <span className="card-avaliacao">⭐ {avaliacao}</span>
        </div>
      </div>
    </section>
  );
}
