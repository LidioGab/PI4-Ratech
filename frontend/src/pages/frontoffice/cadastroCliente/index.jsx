import './index.css';
import HeaderFrontoffice from "../../../components/headerFrontoffice/index.jsx";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatarCPF, validarCPF } from '../../../utils/cpf.js';
import api from '../../../services/api.js';

export default function CadastroCliente() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    confirmacaoSenha: '',
    dataNascimento: '',
    genero: '',
    enderecoFaturamento: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    },
    enderecosEntrega: [{
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    }]
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [copiarEndereco, setCopiarEndereco] = useState(false);
  const navigate = useNavigate();

  const buscarCep = async (cep, isEntrega = false, index = 0) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setErrors(prev => ({ 
          ...prev, 
          [`${isEntrega ? 'entrega' : 'faturamento'}_cep`]: 'CEP não encontrado' 
        }));
        return;
      }

      const cepFormatado = `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
      
      if (isEntrega) {
        const novosEnderecos = [...formData.enderecosEntrega];
        novosEnderecos[index] = {
          ...novosEnderecos[index],
          cep: cepFormatado,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf
        };
        setFormData(prev => ({ 
          ...prev, 
          enderecosEntrega: novosEnderecos 
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          enderecoFaturamento: {
            ...prev.enderecoFaturamento,
            cep: cepFormatado,
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            uf: data.uf
          }
        }));
      }

      // Limpar erro do CEP se foi preenchido com sucesso
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${isEntrega ? 'entrega' : 'faturamento'}_cep`];
        return newErrors;
      });

    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        [`${isEntrega ? 'entrega' : 'faturamento'}_cep`]: 'Erro ao buscar CEP' 
      }));
    }
  };

  const copiarEnderecoFaturamento = (copiar) => {
    if (copiar) {
      // Quando copiar endereço, usar o de faturamento como único endereço de entrega
      setFormData(prev => ({
        ...prev,
        enderecosEntrega: [{ ...prev.enderecoFaturamento }]
      }));
    } else {
      // Quando não copiar, limpar os endereços de entrega
      setFormData(prev => ({
        ...prev,
        enderecosEntrega: [{
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: ''
        }]
      }));
    }
  };

  const adicionarEnderecoEntrega = () => {
    setFormData(prev => ({
      ...prev,
      enderecosEntrega: [
        ...prev.enderecosEntrega,
        {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: ''
        }
      ]
    }));
  };

  const removerEnderecoEntrega = (index) => {
    if (formData.enderecosEntrega.length > 1) {
      const novosEnderecos = formData.enderecosEntrega.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        enderecosEntrega: novosEnderecos
      }));
      
      // Limpar erros relacionados aos endereços removidos
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`entrega_${index}_`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  const handleInputChange = (field, value, isEntrega = false, index = 0) => {
    if (field === 'cpf') {
      value = formatarCPF(value);
    }

    if (isEntrega) {
      const novosEnderecos = [...formData.enderecosEntrega];
      novosEnderecos[index] = {
        ...novosEnderecos[index],
        [field]: value
      };
      setFormData(prev => ({
        ...prev,
        enderecosEntrega: novosEnderecos
      }));
    } else if (field.startsWith('endereco_')) {
      const campoEndereco = field.replace('endereco_', '');
      setFormData(prev => ({
        ...prev,
        enderecoFaturamento: {
          ...prev.enderecoFaturamento,
          [campoEndereco]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Limpar erro do campo quando o usuário digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else {
      const palavras = formData.nome.trim().split(/\s+/);
      if (palavras.length < 2) {
        newErrors.nome = 'Nome deve ter pelo menos 2 palavras';
      } else if (palavras.some(palavra => palavra.length < 3)) {
        newErrors.nome = 'Cada palavra deve ter pelo menos 3 letras';
      }
    }

    // Validar CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validarCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar confirmação de senha
    if (!formData.confirmacaoSenha) {
      newErrors.confirmacaoSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmacaoSenha) {
      newErrors.confirmacaoSenha = 'Senhas não conferem';
    }

    // Validar data de nascimento
    if (!formData.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    }

    // Validar gênero
    if (!formData.genero) {
      newErrors.genero = 'Gênero é obrigatório';
    }

    // Validar endereços
    const validarEndereco = (endereco, prefixo) => {
      if (!endereco.cep) newErrors[`${prefixo}_cep`] = 'CEP é obrigatório';
      if (!endereco.logradouro) newErrors[`${prefixo}_logradouro`] = 'Logradouro é obrigatório';
      if (!endereco.numero) newErrors[`${prefixo}_numero`] = 'Número é obrigatório';
      if (!endereco.bairro) newErrors[`${prefixo}_bairro`] = 'Bairro é obrigatório';
      if (!endereco.cidade) newErrors[`${prefixo}_cidade`] = 'Cidade é obrigatória';
      if (!endereco.uf) newErrors[`${prefixo}_uf`] = 'UF é obrigatória';
    };

    validarEndereco(formData.enderecoFaturamento, 'faturamento');
    
    // Só validar endereços de entrega se não estiver copiando do faturamento
    if (!copiarEndereco) {
      formData.enderecosEntrega.forEach((endereco, index) => {
        validarEndereco(endereco, `entrega_${index}`);
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/clientes/cadastro', formData);

      alert('Cadastro realizado com sucesso!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data || 'Erro ao conectar com o servidor';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-cliente-page">
      <HeaderFrontoffice nome="Criar Nova Conta" showBackButton={true} backTo="/" />
      
      <section className="form-section">
        <h1>Crie sua conta</h1>
        <p className="subtitle">Preencha todos os campos para criar sua conta</p>
        
        <form onSubmit={handleSubmit}>
          {/* Dados Pessoais */}
          <div className="form-group">
            <h3>Dados Pessoais</h3>
            
            <div className="form-inputs">
              <label htmlFor="nome">Nome Completo *</label>
              <input 
                type="text" 
                id="nome"
                placeholder="Digite seu nome completo"
                value={formData.nome} 
                onChange={e => handleInputChange('nome', e.target.value)}
                className={errors.nome ? 'error' : ''}
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>

            <div className="form-row">
              <div className="form-inputs">
                <label htmlFor="cpf">CPF *</label>
                <input 
                  type="text" 
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf} 
                  onChange={e => handleInputChange('cpf', e.target.value)}
                  className={errors.cpf ? 'error' : ''}
                  maxLength="14"
                />
                {errors.cpf && <span className="error-message">{errors.cpf}</span>}
              </div>

              <div className="form-inputs">
                <label htmlFor="email">Email *</label>
                <input 
                  type="email" 
                  id="email"
                  placeholder="seuemail@exemplo.com"
                  value={formData.email} 
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-inputs">
                <label htmlFor="dataNascimento">Data de Nascimento *</label>
                <input 
                  type="date" 
                  id="dataNascimento"
                  value={formData.dataNascimento} 
                  onChange={e => handleInputChange('dataNascimento', e.target.value)}
                  className={errors.dataNascimento ? 'error' : ''}
                />
                {errors.dataNascimento && <span className="error-message">{errors.dataNascimento}</span>}
              </div>

              <div className="form-inputs">
                <label htmlFor="genero">Gênero *</label>
                <select 
                  id="genero"
                  value={formData.genero} 
                  onChange={e => handleInputChange('genero', e.target.value)}
                  className={errors.genero ? 'error' : ''}
                >
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="OUTRO">Outro</option>
                  <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
                </select>
                {errors.genero && <span className="error-message">{errors.genero}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-inputs">
                <label htmlFor="senha">Senha *</label>
                <input 
                  type="password" 
                  id="senha"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.senha} 
                  onChange={e => handleInputChange('senha', e.target.value)}
                  className={errors.senha ? 'error' : ''}
                />
                {errors.senha && <span className="error-message">{errors.senha}</span>}
              </div>

              <div className="form-inputs">
                <label htmlFor="confirmacaoSenha">Confirmar Senha *</label>
                <input 
                  type="password" 
                  id="confirmacaoSenha"
                  placeholder="Confirme sua senha"
                  value={formData.confirmacaoSenha} 
                  onChange={e => handleInputChange('confirmacaoSenha', e.target.value)}
                  className={errors.confirmacaoSenha ? 'error' : ''}
                />
                {errors.confirmacaoSenha && <span className="error-message">{errors.confirmacaoSenha}</span>}
              </div>
            </div>
          </div>

          {/* Endereço de Faturamento */}
          <div className="form-group">
            <h3>Endereço de Faturamento</h3>
            
            <div className="form-row">
              <div className="form-inputs">
                <label htmlFor="faturamento_cep">CEP *</label>
                <input 
                  type="text" 
                  id="faturamento_cep"
                  placeholder="00000-000"
                  value={formData.enderecoFaturamento.cep} 
                  onChange={e => handleInputChange('endereco_cep', e.target.value)}
                  onBlur={e => buscarCep(e.target.value)}
                  className={errors.faturamento_cep ? 'error' : ''}
                  maxLength="9"
                />
                {errors.faturamento_cep && <span className="error-message">{errors.faturamento_cep}</span>}
              </div>

              <div className="form-inputs">
                <label htmlFor="faturamento_logradouro">Logradouro *</label>
                <input 
                  type="text" 
                  id="faturamento_logradouro"
                  placeholder="Rua, Avenida, etc."
                  value={formData.enderecoFaturamento.logradouro} 
                  onChange={e => handleInputChange('endereco_logradouro', e.target.value)}
                  className={errors.faturamento_logradouro ? 'error' : ''}
                />
                {errors.faturamento_logradouro && <span className="error-message">{errors.faturamento_logradouro}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-inputs">
                <label htmlFor="faturamento_numero">Número *</label>
                <input 
                  type="text" 
                  id="faturamento_numero"
                  placeholder="123"
                  value={formData.enderecoFaturamento.numero} 
                  onChange={e => handleInputChange('endereco_numero', e.target.value)}
                  className={errors.faturamento_numero ? 'error' : ''}
                />
                {errors.faturamento_numero && <span className="error-message">{errors.faturamento_numero}</span>}
              </div>

              <div className="form-inputs">
                <label htmlFor="faturamento_complemento">Complemento</label>
                <input 
                  type="text" 
                  id="faturamento_complemento"
                  placeholder="Apto, Casa, etc."
                  value={formData.enderecoFaturamento.complemento} 
                  onChange={e => handleInputChange('endereco_complemento', e.target.value)}
                />
              </div>

              <div className="form-inputs">
                <label htmlFor="faturamento_bairro">Bairro *</label>
                <input 
                  type="text" 
                  id="faturamento_bairro"
                  placeholder="Nome do bairro"
                  value={formData.enderecoFaturamento.bairro} 
                  onChange={e => handleInputChange('endereco_bairro', e.target.value)}
                  className={errors.faturamento_bairro ? 'error' : ''}
                />
                {errors.faturamento_bairro && <span className="error-message">{errors.faturamento_bairro}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-inputs">
                <label htmlFor="faturamento_cidade">Cidade *</label>
                <input 
                  type="text" 
                  id="faturamento_cidade"
                  placeholder="Nome da cidade"
                  value={formData.enderecoFaturamento.cidade} 
                  onChange={e => handleInputChange('endereco_cidade', e.target.value)}
                  className={errors.faturamento_cidade ? 'error' : ''}
                />
                {errors.faturamento_cidade && <span className="error-message">{errors.faturamento_cidade}</span>}
              </div>

              <div className="form-inputs">
                <label htmlFor="faturamento_uf">UF *</label>
                <input 
                  type="text" 
                  id="faturamento_uf"
                  placeholder="SP"
                  value={formData.enderecoFaturamento.uf} 
                  onChange={e => handleInputChange('endereco_uf', e.target.value.toUpperCase())}
                  className={errors.faturamento_uf ? 'error' : ''}
                  maxLength="2"
                />
                {errors.faturamento_uf && <span className="error-message">{errors.faturamento_uf}</span>}
              </div>
            </div>
          </div>

          {/* Endereços de Entrega */}
          <div className="form-group">
            <div className="endereco-header">
              <h3>Endereços de Entrega</h3>
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="copiarEndereco"
                  checked={copiarEndereco}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setCopiarEndereco(checked);
                    copiarEnderecoFaturamento(checked);
                  }}
                />
                <label htmlFor="copiarEndereco">Usar endereço de faturamento como entrega</label>
              </div>
            </div>

            {!copiarEndereco && formData.enderecosEntrega.map((endereco, index) => (
              <div key={index} className="endereco-entrega">
                <div className="endereco-title">
                  <h4>Endereço de Entrega {index + 1}</h4>
                  {formData.enderecosEntrega.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removerEnderecoEntrega(index)}
                      className="remove-btn"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-inputs">
                    <label>CEP *</label>
                    <input 
                      type="text" 
                      placeholder="00000-000"
                      value={endereco.cep} 
                      onChange={e => handleInputChange('cep', e.target.value, true, index)}
                      onBlur={e => buscarCep(e.target.value, true, index)}
                      className={errors[`entrega_${index}_cep`] ? 'error' : ''}
                      maxLength="9"
                    />
                    {errors[`entrega_${index}_cep`] && <span className="error-message">{errors[`entrega_${index}_cep`]}</span>}
                  </div>

                  <div className="form-inputs">
                    <label>Logradouro *</label>
                    <input 
                      type="text" 
                      placeholder="Rua, Avenida, etc."
                      value={endereco.logradouro} 
                      onChange={e => handleInputChange('logradouro', e.target.value, true, index)}
                      className={errors[`entrega_${index}_logradouro`] ? 'error' : ''}
                    />
                    {errors[`entrega_${index}_logradouro`] && <span className="error-message">{errors[`entrega_${index}_logradouro`]}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-inputs">
                    <label>Número *</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      value={endereco.numero} 
                      onChange={e => handleInputChange('numero', e.target.value, true, index)}
                      className={errors[`entrega_${index}_numero`] ? 'error' : ''}
                    />
                    {errors[`entrega_${index}_numero`] && <span className="error-message">{errors[`entrega_${index}_numero`]}</span>}
                  </div>

                  <div className="form-inputs">
                    <label>Complemento</label>
                    <input 
                      type="text" 
                      placeholder="Apto, Casa, etc."
                      value={endereco.complemento} 
                      onChange={e => handleInputChange('complemento', e.target.value, true, index)}
                    />
                  </div>

                  <div className="form-inputs">
                    <label>Bairro *</label>
                    <input 
                      type="text" 
                      placeholder="Nome do bairro"
                      value={endereco.bairro} 
                      onChange={e => handleInputChange('bairro', e.target.value, true, index)}
                      className={errors[`entrega_${index}_bairro`] ? 'error' : ''}
                    />
                    {errors[`entrega_${index}_bairro`] && <span className="error-message">{errors[`entrega_${index}_bairro`]}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-inputs">
                    <label>Cidade *</label>
                    <input 
                      type="text" 
                      placeholder="Nome da cidade"
                      value={endereco.cidade} 
                      onChange={e => handleInputChange('cidade', e.target.value, true, index)}
                      className={errors[`entrega_${index}_cidade`] ? 'error' : ''}
                    />
                    {errors[`entrega_${index}_cidade`] && <span className="error-message">{errors[`entrega_${index}_cidade`]}</span>}
                  </div>

                  <div className="form-inputs">
                    <label>UF *</label>
                    <input 
                      type="text" 
                      placeholder="SP"
                      value={endereco.uf} 
                      onChange={e => handleInputChange('uf', e.target.value.toUpperCase(), true, index)}
                      className={errors[`entrega_${index}_uf`] ? 'error' : ''}
                      maxLength="2"
                    />
                    {errors[`entrega_${index}_uf`] && <span className="error-message">{errors[`entrega_${index}_uf`]}</span>}
                  </div>
                </div>
              </div>
            ))}

            {!copiarEndereco && (
              <button 
                type="button" 
                onClick={adicionarEnderecoEntrega}
                className="add-address-btn"
              >
                + Adicionar outro endereço de entrega
              </button>
            )}
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
          
          <button 
            className="cadastro-btn" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>

          <div className="form-footer">
            <p>Após o cadastro, você poderá fazer suas compras!</p>
          </div>
        </form>
      </section>
    </div>
  );
}
