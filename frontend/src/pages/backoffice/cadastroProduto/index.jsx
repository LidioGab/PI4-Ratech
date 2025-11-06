import './index.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Header from '../../../components/header';
import MenuLateral from '../../../components/menuLateral';

export default function CadastroProduto() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    avaliacao: '',
    descricao: '',
    preco: '',
    quantidadeEstoque: '',
    imagens: []
  });
  const [imagemPrincipal, setImagemPrincipal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
      const validation = {};
      if (!formData.nome || formData.nome.length > 200) validation.nome = 'Nome obrigatório (<=200)';
      const aval = parseFloat(formData.avaliacao);
      if (isNaN(aval) || aval < 1 || aval > 5 || (aval * 10) % 5 !== 0) validation.avaliacao = 'Avaliação 1 a 5 passo 0.5';
      if (!formData.preco || Number(formData.preco) <= 0) validation.preco = 'Preço > 0';
      if (formData.descricao.length === 0 || formData.descricao.length > 2000) validation.descricao = 'Descrição obrigatória (<=2000)';
      const qtd = parseInt(formData.quantidadeEstoque);
      if (isNaN(qtd) || qtd < 0) validation.quantidadeEstoque = 'Quantidade inválida';
      setErrors(validation);
      if (Object.keys(validation).length > 0) { setLoading(false); return; }

      const payload = {
        nome: formData.nome,
        avaliacao: formData.avaliacao ? Number(formData.avaliacao) : null,
        descricao: formData.descricao,
        preco: Number(formData.preco),
        quantidadeEstoque: qtd
      };

      const produtoResp = await api.post('/api/produtos', payload);
      const produtoId = produtoResp.data.id;

      if (formData.imagens.length > 0) {
        const form = new FormData();
        formData.imagens.forEach(img => form.append('files', img.file));
        if (imagemPrincipal != null) {
          form.append('principalIndex', imagemPrincipal);
        }
        try {
          console.log('Enviando imagens produto', produtoId, formData.imagens.length);
          await api.post(`/api/produtos/${produtoId}/imagens`, form);
        } catch (errUpload) {
          console.error('Falha upload imagens', errUpload);
          alert('Produto criado, mas houve erro ao enviar imagens. Você pode tentar editar e reenviar.');
        }
      }

  alert('Produto cadastrado com sucesso!');
  navigate(`/visualizar-produto/${produtoId}`);
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      alert('Erro ao cadastrar produto');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
  navigate('/produtos');
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
                <label htmlFor="nome">Nome do Produto *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  maxLength={200}
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o nome do produto"
                />
                {errors.nome && <span style={{color:'red', fontSize:12}}>{errors.nome}</span>}
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
                <label htmlFor="quantidadeEstoque">Qtd. em Estoque *</label>
                <input
                  type="number"
                  id="quantidadeEstoque"
                  name="quantidadeEstoque"
                  value={formData.quantidadeEstoque}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: 100"
                />
                {errors.quantidadeEstoque && <span style={{color:'red', fontSize:12}}>{errors.quantidadeEstoque}</span>}
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
                {errors.descricao && <span style={{color:'red', fontSize:12}}>{errors.descricao}</span>}
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
