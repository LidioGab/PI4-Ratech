package com.pi4.backend.api.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.entities.EnderecoCliente;
import com.pi4.backend.api.repositories.ClienteRepository;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Pattern REAL_CPF_PATTERN = Pattern.compile("^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2})$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern CEP_PATTERN = Pattern.compile("^\\d{5}-\\d{3}$");

    private boolean isValidCpf(String cpf) {
        if (cpf == null) return false;
        return REAL_CPF_PATTERN.matcher(cpf).matches();
    }

    private boolean isValidEmail(String email) {
        if (email == null) return false;
        return EMAIL_PATTERN.matcher(email).matches();
    }

    private boolean isValidCep(String cep) {
        if (cep == null) return false;
        return CEP_PATTERN.matcher(cep).matches();
    }

    private boolean isValidNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) return false;
        String[] palavras = nome.trim().split("\\s+");
        if (palavras.length < 2) return false;
        for (String palavra : palavras) {
            if (palavra.length() < 3) return false;
        }
        return true;
    }

    // CADASTRAR CLIENTE
    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrarCliente(@RequestBody CadastroClienteDto dto) {
        try {
            // Validações básicas
            if (dto.getNome() == null || dto.getEmail() == null || dto.getCpf() == null || 
                dto.getSenha() == null || dto.getConfirmacaoSenha() == null || 
                dto.getDataNascimento() == null || dto.getGenero() == null) {
                return ResponseEntity.badRequest().body("Campos obrigatórios ausentes");
            }

            // Validar confirmação de senha
            if (!dto.getSenha().equals(dto.getConfirmacaoSenha())) {
                return ResponseEntity.badRequest().body("Senhas não conferem");
            }

            // Validar nome (mínimo 2 palavras, 3 letras cada)
            if (!isValidNome(dto.getNome())) {
                return ResponseEntity.badRequest().body("Nome deve ter pelo menos 2 palavras com 3 letras cada");
            }

            // Validar CPF
            if (!isValidCpf(dto.getCpf())) {
                return ResponseEntity.badRequest().body("CPF inválido (formato esperado 000.000.000-00)");
            }

            // Validar email
            if (!isValidEmail(dto.getEmail())) {
                return ResponseEntity.badRequest().body("Email inválido");
            }

            // Verificar se email já existe
            if (clienteRepository.existsByEmail(dto.getEmail())) {
                return ResponseEntity.badRequest().body("Email já cadastrado");
            }

            // Verificar se CPF já existe
            if (clienteRepository.existsByCpf(dto.getCpf())) {
                return ResponseEntity.badRequest().body("CPF já cadastrado");
            }

            // Validar gênero
            try {
                Cliente.Genero.valueOf(dto.getGenero().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Gênero inválido");
            }

            // Validar endereços obrigatórios
            if (dto.getEnderecoFaturamento() == null) {
                return ResponseEntity.badRequest().body("Endereço de faturamento é obrigatório");
            }

            if (dto.getEnderecosEntrega() == null || dto.getEnderecosEntrega().isEmpty()) {
                return ResponseEntity.badRequest().body("Pelo menos um endereço de entrega é obrigatório");
            }

            // Validar endereço de faturamento
            if (!validarEndereco(dto.getEnderecoFaturamento())) {
                return ResponseEntity.badRequest().body("Endereço de faturamento inválido");
            }

            // Validar endereços de entrega
            for (EnderecoDto endereco : dto.getEnderecosEntrega()) {
                if (!validarEndereco(endereco)) {
                    return ResponseEntity.badRequest().body("Um dos endereços de entrega é inválido");
                }
            }

            // Criar cliente
            Cliente cliente = new Cliente();
            cliente.setNome(dto.getNome());
            cliente.setEmail(dto.getEmail());
            cliente.setCpf(dto.getCpf());
            cliente.setSenha(passwordEncoder.encode(dto.getSenha()));
            cliente.setDataNascimento(dto.getDataNascimento());
            cliente.setGenero(Cliente.Genero.valueOf(dto.getGenero().toUpperCase()));
            cliente.setStatus(true);
            cliente.setDataCriacao(LocalDateTime.now());

            // Criar lista de endereços
            List<EnderecoCliente> enderecos = new ArrayList<>();

            // Adicionar endereço de faturamento
            EnderecoCliente enderecoFat = criarEndereco(dto.getEnderecoFaturamento(), cliente, EnderecoCliente.TipoEndereco.FATURAMENTO);
            enderecos.add(enderecoFat);

            // Adicionar endereços de entrega
            for (EnderecoDto enderecoDto : dto.getEnderecosEntrega()) {
                EnderecoCliente enderecoEnt = criarEndereco(enderecoDto, cliente, EnderecoCliente.TipoEndereco.ENTREGA);
                enderecos.add(enderecoEnt);
            }

            cliente.setEnderecos(enderecos);

            // Salvar cliente (cascade salvará os endereços)
            clienteRepository.save(cliente);

            return ResponseEntity.status(HttpStatus.CREATED).body("Cliente cadastrado com sucesso! Faça login para continuar.");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno do servidor");
        }
    }

    private boolean validarEndereco(EnderecoDto endereco) {
        return endereco != null &&
               isValidCep(endereco.getCep()) &&
               endereco.getLogradouro() != null && !endereco.getLogradouro().trim().isEmpty() &&
               endereco.getNumero() != null && !endereco.getNumero().trim().isEmpty() &&
               endereco.getBairro() != null && !endereco.getBairro().trim().isEmpty() &&
               endereco.getCidade() != null && !endereco.getCidade().trim().isEmpty() &&
               endereco.getUf() != null && endereco.getUf().length() == 2;
    }

    private EnderecoCliente criarEndereco(EnderecoDto dto, Cliente cliente, EnderecoCliente.TipoEndereco tipo) {
        EnderecoCliente endereco = new EnderecoCliente();
        endereco.setCliente(cliente);
        endereco.setTipo(tipo);
        endereco.setCep(dto.getCep());
        endereco.setLogradouro(dto.getLogradouro());
        endereco.setNumero(dto.getNumero());
        endereco.setComplemento(dto.getComplemento());
        endereco.setBairro(dto.getBairro());
        endereco.setCidade(dto.getCidade());
        endereco.setUf(dto.getUf().toUpperCase());
        endereco.setAtivo(true);
        endereco.setDataCriacao(LocalDateTime.now());
        return endereco;
    }

    // DTOs
    public static class CadastroClienteDto {
        private String nome;
        private String cpf;
        private String email;
        private String senha;
        private String confirmacaoSenha;
        private LocalDate dataNascimento;
        private String genero;
        private EnderecoDto enderecoFaturamento;
        private List<EnderecoDto> enderecosEntrega;

        // Getters e Setters
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getCpf() { return cpf; }
        public void setCpf(String cpf) { this.cpf = cpf; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSenha() { return senha; }
        public void setSenha(String senha) { this.senha = senha; }
        public String getConfirmacaoSenha() { return confirmacaoSenha; }
        public void setConfirmacaoSenha(String confirmacaoSenha) { this.confirmacaoSenha = confirmacaoSenha; }
        public LocalDate getDataNascimento() { return dataNascimento; }
        public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
        public String getGenero() { return genero; }
        public void setGenero(String genero) { this.genero = genero; }
        public EnderecoDto getEnderecoFaturamento() { return enderecoFaturamento; }
        public void setEnderecoFaturamento(EnderecoDto enderecoFaturamento) { this.enderecoFaturamento = enderecoFaturamento; }
        public List<EnderecoDto> getEnderecosEntrega() { return enderecosEntrega; }
        public void setEnderecosEntrega(List<EnderecoDto> enderecosEntrega) { this.enderecosEntrega = enderecosEntrega; }
    }

    public static class EnderecoDto {
        private String cep;
        private String logradouro;
        private String numero;
        private String complemento;
        private String bairro;
        private String cidade;
        private String uf;

        // Getters e Setters
        public String getCep() { return cep; }
        public void setCep(String cep) { this.cep = cep; }
        public String getLogradouro() { return logradouro; }
        public void setLogradouro(String logradouro) { this.logradouro = logradouro; }
        public String getNumero() { return numero; }
        public void setNumero(String numero) { this.numero = numero; }
        public String getComplemento() { return complemento; }
        public void setComplemento(String complemento) { this.complemento = complemento; }
        public String getBairro() { return bairro; }
        public void setBairro(String bairro) { this.bairro = bairro; }
        public String getCidade() { return cidade; }
        public void setCidade(String cidade) { this.cidade = cidade; }
        public String getUf() { return uf; }
        public void setUf(String uf) { this.uf = uf; }
    }
}
