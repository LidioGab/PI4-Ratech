import './index.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { validarCPF } from '../../../utils/cpf';

export default function PerfilCliente() {
  const navigate = useNavigate();
  const [clienteLogado, setClienteLogado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');
  
  // Estados para dados pessoais
  const [dadosPessoais, setDadosPessoais] = useState({
    nome: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    genero: ''
  });

  // Estados para alteração de senha
  const [senhas, setSenhas] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  // Estados para endereços
  const [enderecos, setEnderecos] = useState([]);
  const [novoEndereco, setNovoEndereco] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    tipoEndereco: 'ENTREGA'
  });

  // Estados de controle
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarNovoEndereco, setMostrarNovoEndereco] = useState(false);

  useEffect(() => {
    const cliente = localStorage.getItem('clienteSession');
    if (!cliente) {
      navigate('/login');
      return;
    }

    try {
      const clienteData = JSON.parse(cliente);
      setClienteLogado(clienteData);
      carregarDadosCompletos(clienteData.id);
    } catch (error) {
      console.error('Erro ao parsear sessão do cliente:', error);
      navigate('/login');
    }
  }, [navigate]);

  async function carregarDadosCompletos(clienteId) {
    try {
      setLoading(true);
      const response = await api.get(`/clientes/${clienteId}`);
      const cliente = response.data;
      
      setDadosPessoais({
        nome: cliente.nome || '',
        email: cliente.email || '',
        cpf: cliente.cpf || '',
        dataNascimento: cliente.dataNascimento || '',
        genero: cliente.genero || ''
      });

      setEnderecos(cliente.enderecos || []);
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
      mostrarMensagem('Erro ao carregar dados do cliente', 'erro');
    } finally {
      setLoading(false);
    }
  }

  function mostrarMensagem(texto, tipo) {
    setMensagem(texto);
    setTipoMensagem(tipo);
    setTimeout(() => {
      setMensagem('');
      setTipoMensagem('');
    }, 5000);
  }

  async function handleSalvarDadosPessoais(e) {
    e.preventDefault();
    
    if (!dadosPessoais.nome.trim()) {
      mostrarMensagem('Nome é obrigatório', 'erro');
      return;
    }

    if (!validarCPF(dadosPessoais.cpf)) {
      mostrarMensagem('CPF inválido', 'erro');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/clientes/${clienteLogado.id}`, dadosPessoais);
      
      // Atualizar sessão local
      const novaSessionData = { ...clienteLogado, nome: dadosPessoais.nome };
      localStorage.setItem('clienteSession', JSON.stringify(novaSessionData));
      setClienteLogado(novaSessionData);
      
      mostrarMensagem('Dados atualizados com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      const mensagemErro = error.response?.data?.message || 'Erro ao atualizar dados';
      mostrarMensagem(mensagemErro, 'erro');
    } finally {
      setLoading(false);
    }
  }

  async function handleAlterarSenha(e) {
    e.preventDefault();

    if (!senhas.senhaAtual.trim()) {
      mostrarMensagem('Senha atual é obrigatória', 'erro');
      return;
    }

    if (senhas.novaSenha.length < 6) {
      mostrarMensagem('Nova senha deve ter pelo menos 6 caracteres', 'erro');
      return;
    }

    if (senhas.novaSenha !== senhas.confirmarSenha) {
      mostrarMensagem('Confirmação de senha não confere', 'erro');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/clientes/${clienteLogado.id}/senha`, {
        senhaAtual: senhas.senhaAtual,
        novaSenha: senhas.novaSenha
      });

      setSenhas({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
      setMostrarSenha(false);
      mostrarMensagem('Senha alterada com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      const mensagemErro = error.response?.data?.message || 'Erro ao alterar senha';
      mostrarMensagem(mensagemErro, 'erro');
    } finally {
      setLoading(false);
    }
  }

  async function buscarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await response.json();
      
      if (!dados.erro) {
        setNovoEndereco(prev => ({
          ...prev,
          logradouro: dados.logradouro || '',
          bairro: dados.bairro || '',
          cidade: dados.localidade || '',
          estado: dados.uf || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  }

  async function handleAdicionarEndereco(e) {
    e.preventDefault();

    if (!novoEndereco.cep.trim() || !novoEndereco.logradouro.trim() || 
        !novoEndereco.numero.trim() || !novoEndereco.bairro.trim() ||
        !novoEndereco.cidade.trim() || !novoEndereco.estado.trim()) {
      mostrarMensagem('Todos os campos obrigatórios devem ser preenchidos', 'erro');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/clientes/${clienteLogado.id}/enderecos`, novoEndereco);
      
      setEnderecos(prev => [...prev, response.data]);
      setNovoEndereco({
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        tipoEndereco: 'ENTREGA'
      });
      setMostrarNovoEndereco(false);
      mostrarMensagem('Endereço adicionado com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao adicionar endereço:', error);
      const mensagemErro = error.response?.data?.message || 'Erro ao adicionar endereço';
      mostrarMensagem(mensagemErro, 'erro');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoverEndereco(enderecoId) {
    if (!confirm('Tem certeza que deseja remover este endereço?')) return;

    try {
      setLoading(true);
      await api.delete(`/clientes/${clienteLogado.id}/enderecos/${enderecoId}`);
      
      setEnderecos(prev => prev.filter(end => end.id !== enderecoId));
      mostrarMensagem('Endereço removido com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao remover endereço:', error);
      const mensagemErro = error.response?.data?.message || 'Erro ao remover endereço';
      mostrarMensagem(mensagemErro, 'erro');
    } finally {
      setLoading(false);
    }
  }

  if (loading && !clienteLogado) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="perfil-cliente-container">
      <div className="perfil-header">
        <h1>Alterar Dados do Cliente</h1>
        <p>Gerencie suas informações pessoais e endereços</p>
      </div>

      {mensagem && (
        <div className={`mensagem ${tipoMensagem}`}>
          {mensagem}
        </div>
      )}

      <div className="perfil-content">
        {/* Dados Pessoais */}
        <section className="section-card">
          <h2>Dados Pessoais</h2>
          <form onSubmit={handleSalvarDadosPessoais}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={dadosPessoais.nome}
                  onChange={(e) => setDadosPessoais(prev => ({...prev, nome: e.target.value}))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={dadosPessoais.email}
                  readOnly
                  className="readonly"
                  title="Email não pode ser alterado"
                />
              </div>

              <div className="form-group">
                <label>CPF *</label>
                <input
                  type="text"
                  value={dadosPessoais.cpf}
                  readOnly
                  className="readonly"
                  title="CPF não pode ser alterado"
                />
              </div>

              <div className="form-group">
                <label>Data de Nascimento</label>
                <input
                  type="date"
                  value={dadosPessoais.dataNascimento}
                  onChange={(e) => setDadosPessoais(prev => ({...prev, dataNascimento: e.target.value}))}
                />
              </div>

              <div className="form-group">
                <label>Gênero</label>
                <select
                  value={dadosPessoais.genero}
                  onChange={(e) => setDadosPessoais(prev => ({...prev, genero: e.target.value}))}
                >
                  <option value="">Selecione...</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="OUTRO">Outro</option>
                  <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Dados Pessoais'}
            </button>
          </form>
        </section>

        {/* Alteração de Senha */}
        <section className="section-card">
          <div className="section-header">
            <h2>Alterar Senha</h2>
            <button 
              type="button" 
              className="btn-toggle"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? 'Cancelar' : 'Alterar Senha'}
            </button>
          </div>

          {mostrarSenha && (
            <form onSubmit={handleAlterarSenha}>
              <div className="form-group">
                <label>Senha Atual *</label>
                <input
                  type="password"
                  value={senhas.senhaAtual}
                  onChange={(e) => setSenhas(prev => ({...prev, senhaAtual: e.target.value}))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nova Senha * (mínimo 6 caracteres)</label>
                <input
                  type="password"
                  value={senhas.novaSenha}
                  onChange={(e) => setSenhas(prev => ({...prev, novaSenha: e.target.value}))}
                  minLength="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmar Nova Senha *</label>
                <input
                  type="password"
                  value={senhas.confirmarSenha}
                  onChange={(e) => setSenhas(prev => ({...prev, confirmarSenha: e.target.value}))}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </form>
          )}
        </section>

        {/* Endereços */}
        <section className="section-card">
          <div className="section-header">
            <h2>Endereços de Entrega</h2>
            <button 
              type="button" 
              className="btn-add"
              onClick={() => setMostrarNovoEndereco(!mostrarNovoEndereco)}
            >
              {mostrarNovoEndereco ? 'Cancelar' : '+ Adicionar Endereço'}
            </button>
          </div>

          {/* Lista de endereços existentes */}
          <div className="enderecos-lista">
            {enderecos.map((endereco) => (
              <div key={endereco.id} className="endereco-card">
                <div className="endereco-info">
                  <h4>{endereco.tipoEndereco}</h4>
                  <p>
                    {endereco.logradouro}, {endereco.numero}
                    {endereco.complemento && `, ${endereco.complemento}`}
                  </p>
                  <p>{endereco.bairro} - {endereco.cidade}/{endereco.estado}</p>
                  <p>CEP: {endereco.cep}</p>
                </div>
                <button 
                  className="btn-remove"
                  onClick={() => handleRemoverEndereco(endereco.id)}
                  disabled={loading}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          {/* Formulário para novo endereço */}
          {mostrarNovoEndereco && (
            <form onSubmit={handleAdicionarEndereco} className="novo-endereco-form">
              <h3>Adicionar Novo Endereço</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>CEP *</label>
                  <input
                    type="text"
                    value={novoEndereco.cep}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setNovoEndereco(prev => ({...prev, cep: valor}));
                      if (valor.length === 8) {
                        buscarCEP(valor);
                      }
                    }}
                    placeholder="00000000"
                    maxLength="8"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Endereço</label>
                  <select
                    value={novoEndereco.tipoEndereco}
                    onChange={(e) => setNovoEndereco(prev => ({...prev, tipoEndereco: e.target.value}))}
                  >
                    <option value="ENTREGA">Entrega</option>
                    <option value="COBRANCA">Cobrança</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Logradouro *</label>
                  <input
                    type="text"
                    value={novoEndereco.logradouro}
                    onChange={(e) => setNovoEndereco(prev => ({...prev, logradouro: e.target.value}))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Número *</label>
                  <input
                    type="text"
                    value={novoEndereco.numero}
                    onChange={(e) => setNovoEndereco(prev => ({...prev, numero: e.target.value}))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Complemento</label>
                  <input
                    type="text"
                    value={novoEndereco.complemento}
                    onChange={(e) => setNovoEndereco(prev => ({...prev, complemento: e.target.value}))}
                  />
                </div>

                <div className="form-group">
                  <label>Bairro *</label>
                  <input
                    type="text"
                    value={novoEndereco.bairro}
                    onChange={(e) => setNovoEndereco(prev => ({...prev, bairro: e.target.value}))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cidade *</label>
                  <input
                    type="text"
                    value={novoEndereco.cidade}
                    onChange={(e) => setNovoEndereco(prev => ({...prev, cidade: e.target.value}))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Estado *</label>
                  <input
                    type="text"
                    value={novoEndereco.estado}
                    onChange={(e) => setNovoEndereco(prev => ({...prev, estado: e.target.value.toUpperCase()}))}
                    maxLength="2"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adicionando...' : 'Adicionar Endereço'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
