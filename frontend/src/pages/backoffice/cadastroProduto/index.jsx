import './index.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';

export default function CadastroProduto() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomeProduto: '',
    avaliacao: '',
    descricao: '',
    preco: '',
    qtdEstoque: '',
    imagens: []
  });
  const [imagemPrincipal, setImagemPrincipal] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    const novasImagens = files.map((file, index) => {
      return {
        file,
        nomeOriginal: file.name,
        urlPreview: URL.createObjectURL(file)
      };
    });

    setFormData(prev => ({
      ...prev,
      imagens: [...prev.imagens, ...novasImagens]
    }));
  }

  function definirImagemPrincipal(index) {
    setImagemPrincipal(index);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const produtoPayload = {
        nomeProduto: formData.nomeProduto,
        avaliacao: formData.avaliacao,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco).toFixed(2),
        qtdEstoque: parseInt(formData.qtdEstoque),
        imagens: formData.imagens.map((img, i) => ({
          nome: `img_${Date.now()}_${i}_${img.nomeOriginal}`,
          principal: i === imagemPrincipal
        }))
      };

      await axios.post('http://localhost:8080/produtos', produtoPayload);
      alert('Produto cadastrado com sucesso!');
  navigate('/cadastroproduto');
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      alert('Erro ao cadastrar produto');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
  navigate('/cadastroproduto');
  }

  return (
    <div className="admin-layout">
      <Header nome={"Cadastro de Produto"} />
      <div className="admin-content">
        <MenuLateral />
        <div className="cadastro-produto-page">
          <div className="form-header">
            <h1>Cadastrar Novo Produto</h1>
          </div>

          <form onSubmit={handleSubmit} className="produto-form">
            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="nomeProduto">Nome do Produto *</label>
                <input
                  type="text"
                  id="nomeProduto"
                  name="nomeProduto"
                  maxLength={200}
                  value={formData.nomeProduto}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o nome do produto"
                />
              </div>

              <div className="form-group">
                <label htmlFor="avaliacao">Avaliação *</label>
                <input
                  type="number"
                  id="avaliacao"
                  name="avaliacao"
                  step="0.5"
                  min="1"
                  max="5"
                  value={formData.avaliacao}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: 4.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="preco">Preço (R$) *</label>
                <input
                  type="number"
                  id="preco"
                  name="preco"
                  step="0.01"
                  value={formData.preco}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="qtdEstoque">Qtd. em Estoque *</label>
                <input
                  type="number"
                  id="qtdEstoque"
                  name="qtdEstoque"
                  value={formData.qtdEstoque}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: 100"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="descricao">Descrição Detalhada *</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  maxLength={2000}
                  value={formData.descricao}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite a descrição completa do produto"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="imagens">Imagens do Produto *</label>
                <input
                  type="file"
                  id="imagens"
                  name="imagens"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {formData.imagens.length > 0 && (
                <div className="imagens-preview">
                  {formData.imagens.map((img, index) => (
                    <div key={index} className="imagem-item">
                      <img src={img.urlPreview} alt="preview" />
                      <button
                        type="button"
                        className={imagemPrincipal === index ? "principal-btn ativo" : "principal-btn"}
                        onClick={() => definirImagemPrincipal(index)}
                      >
                        {imagemPrincipal === index ? "Imagem Principal" : "Definir como Principal"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
