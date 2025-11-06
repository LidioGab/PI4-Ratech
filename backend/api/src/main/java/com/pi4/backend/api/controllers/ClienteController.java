package com.pi4.backend.api.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.entities.EnderecoCliente;
import com.pi4.backend.api.repositories.ClienteRepository;
import com.pi4.backend.api.repositories.EnderecoClienteRepository;
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EnderecoClienteRepository enderecoClienteRepository;

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

            // Validar endereços de entrega (se houver)
            if (dto.getEnderecosEntrega() != null && !dto.getEnderecosEntrega().isEmpty()) {
                for (EnderecoDto endereco : dto.getEnderecosEntrega()) {
                    if (!validarEndereco(endereco)) {
                        return ResponseEntity.badRequest().body("Um dos endereços de entrega é inválido");
                    }
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

            // Adicionar endereços de entrega (se houver)
            if (dto.getEnderecosEntrega() != null && !dto.getEnderecosEntrega().isEmpty()) {
                for (EnderecoDto enderecoDto : dto.getEnderecosEntrega()) {
                    EnderecoCliente enderecoEnt = criarEndereco(enderecoDto, cliente, EnderecoCliente.TipoEndereco.ENTREGA);
                    enderecos.add(enderecoEnt);
                }
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

    // BUSCAR DADOS COMPLETOS DO CLIENTE
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarCliente(@PathVariable Integer id) {
        try {
            Optional<Cliente> clienteOpt = clienteRepository.findById(id);
            if (!clienteOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Cliente cliente = clienteOpt.get();
            ClienteCompletoDto dto = new ClienteCompletoDto();
            dto.setId(cliente.getId().longValue());
            dto.setNome(cliente.getNome());
            dto.setEmail(cliente.getEmail());
            dto.setCpf(cliente.getCpf());
            // dto.setTelefone(cliente.getTelefone()); // Campo removido da sprint
            dto.setDataNascimento(cliente.getDataNascimento());
            dto.setGenero(cliente.getGenero().toString());

            // Converter endereços
            List<EnderecoCompletoDto> enderecosDto = new ArrayList<>();
            for (EnderecoCliente endereco : cliente.getEnderecos()) {
                if (endereco.getAtivo()) {
                    EnderecoCompletoDto endDto = new EnderecoCompletoDto();
                    endDto.setId(endereco.getId().longValue());
                    endDto.setCep(endereco.getCep());
                    endDto.setLogradouro(endereco.getLogradouro());
                    endDto.setNumero(endereco.getNumero());
                    endDto.setComplemento(endereco.getComplemento());
                    endDto.setBairro(endereco.getBairro());
                    endDto.setCidade(endereco.getCidade());
                    endDto.setEstado(endereco.getUf());
                    endDto.setTipoEndereco(endereco.getTipo().toString());
                    enderecosDto.add(endDto);
                }
            }
            dto.setEnderecos(enderecosDto);

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno do servidor");
        }
    }

    // ATUALIZAR DADOS PESSOAIS
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarDadosPessoais(@PathVariable Integer id, @RequestBody AtualizarDadosDto dto) {
        try {
            Optional<Cliente> clienteOpt = clienteRepository.findById(id);
            if (!clienteOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Cliente cliente = clienteOpt.get();

            // Validar nome
            if (dto.getNome() != null && !isValidNome(dto.getNome())) {
                return ResponseEntity.badRequest().body("Nome deve ter pelo menos 2 palavras com 3 letras cada");
            }

            // Validar CPF se fornecido (não pode ser alterado, mas validamos por segurança)
            if (dto.getCpf() != null && !dto.getCpf().equals(cliente.getCpf())) {
                return ResponseEntity.badRequest().body("CPF não pode ser alterado");
            }

            // Validar gênero se fornecido
            if (dto.getGenero() != null && !dto.getGenero().isEmpty()) {
                try {
                    Cliente.Genero.valueOf(dto.getGenero().toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Gênero inválido");
                }
                cliente.setGenero(Cliente.Genero.valueOf(dto.getGenero().toUpperCase()));
            }

            // Atualizar campos
            if (dto.getNome() != null) cliente.setNome(dto.getNome());
            // if (dto.getTelefone() != null) cliente.setTelefone(dto.getTelefone()); // Campo removido da sprint
            if (dto.getDataNascimento() != null) cliente.setDataNascimento(dto.getDataNascimento());

            clienteRepository.save(cliente);

            return ResponseEntity.ok("Dados atualizados com sucesso");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno do servidor");
        }
    }

    // ALTERAR SENHA
    @PutMapping("/{id}/senha")
    public ResponseEntity<?> alterarSenha(@PathVariable Integer id, @RequestBody AlterarSenhaDto dto) {
        try {
            Optional<Cliente> clienteOpt = clienteRepository.findById(id);
            if (!clienteOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Cliente cliente = clienteOpt.get();

            // Verificar senha atual
            if (!passwordEncoder.matches(dto.getSenhaAtual(), cliente.getSenha())) {
                return ResponseEntity.badRequest().body("Senha atual incorreta");
            }

            // Validar nova senha
            if (dto.getNovaSenha() == null || dto.getNovaSenha().length() < 6) {
                return ResponseEntity.badRequest().body("Nova senha deve ter pelo menos 6 caracteres");
            }

            // Atualizar senha
            cliente.setSenha(passwordEncoder.encode(dto.getNovaSenha()));
            clienteRepository.save(cliente);

            return ResponseEntity.ok("Senha alterada com sucesso");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno do servidor");
        }
    }

    // ADICIONAR ENDEREÇO
    @PostMapping("/{id}/enderecos")
    public ResponseEntity<?> adicionarEndereco(@PathVariable Integer id, @RequestBody NovoEnderecoDto dto) {
        try {
            Optional<Cliente> clienteOpt = clienteRepository.findById(id);
            if (!clienteOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Cliente cliente = clienteOpt.get();

            // Validar endereço
            if (!validarNovoEndereco(dto)) {
                return ResponseEntity.badRequest().body("Dados do endereço inválidos");
            }

            // Criar novo endereço
            EnderecoCliente endereco = new EnderecoCliente();
            endereco.setCliente(cliente);
            endereco.setCep(dto.getCep());
            endereco.setLogradouro(dto.getLogradouro());
            endereco.setNumero(dto.getNumero());
            endereco.setComplemento(dto.getComplemento());
            endereco.setBairro(dto.getBairro());
            endereco.setCidade(dto.getCidade());
            endereco.setUf(dto.getEstado().toUpperCase());
            endereco.setAtivo(true);
            endereco.setDataCriacao(LocalDateTime.now());

            // Definir tipo do endereço
            try {
                endereco.setTipo(EnderecoCliente.TipoEndereco.valueOf(dto.getTipoEndereco().toUpperCase()));
            } catch (IllegalArgumentException e) {
                endereco.setTipo(EnderecoCliente.TipoEndereco.ENTREGA);
            }

            enderecoClienteRepository.save(endereco);

            // Retornar endereço criado
            EnderecoCompletoDto enderecoDto = new EnderecoCompletoDto();
            enderecoDto.setId(endereco.getId().longValue());
            enderecoDto.setCep(endereco.getCep());
            enderecoDto.setLogradouro(endereco.getLogradouro());
            enderecoDto.setNumero(endereco.getNumero());
            enderecoDto.setComplemento(endereco.getComplemento());
            enderecoDto.setBairro(endereco.getBairro());
            enderecoDto.setCidade(endereco.getCidade());
            enderecoDto.setEstado(endereco.getUf());
            enderecoDto.setTipoEndereco(endereco.getTipo().toString());

            return ResponseEntity.status(HttpStatus.CREATED).body(enderecoDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno do servidor");
        }
    }

    // REMOVER ENDEREÇO
    @DeleteMapping("/{clienteId}/enderecos/{enderecoId}")
    public ResponseEntity<?> removerEndereco(@PathVariable Integer clienteId, @PathVariable Integer enderecoId) {
        try {
            Optional<EnderecoCliente> enderecoOpt = enderecoClienteRepository.findById(enderecoId);
            if (!enderecoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            EnderecoCliente endereco = enderecoOpt.get();

            // Verificar se o endereço pertence ao cliente
            if (!endereco.getCliente().getId().equals(clienteId)) {
                return ResponseEntity.badRequest().body("Endereço não pertence ao cliente");
            }

            // Soft delete - marcar como inativo
            endereco.setAtivo(false);
            enderecoClienteRepository.save(endereco);

            return ResponseEntity.ok("Endereço removido com sucesso");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno do servidor");
        }
    }

    private boolean validarNovoEndereco(NovoEnderecoDto endereco) {
        return endereco != null &&
               isValidCep(endereco.getCep()) &&
               endereco.getLogradouro() != null && !endereco.getLogradouro().trim().isEmpty() &&
               endereco.getNumero() != null && !endereco.getNumero().trim().isEmpty() &&
               endereco.getBairro() != null && !endereco.getBairro().trim().isEmpty() &&
               endereco.getCidade() != null && !endereco.getCidade().trim().isEmpty() &&
               endereco.getEstado() != null && endereco.getEstado().length() == 2;
    }

    // DTOs adicionais
    public static class ClienteCompletoDto {
        private Long id;
        private String nome;
        private String email;
        private String cpf;
        // private String telefone; // Campo removido da sprint
        private LocalDate dataNascimento;
        private String genero;
        private List<EnderecoCompletoDto> enderecos;

        // Getters e Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCpf() { return cpf; }
        public void setCpf(String cpf) { this.cpf = cpf; }
        // public String getTelefone() { return telefone; }
        // public void setTelefone(String telefone) { this.telefone = telefone; } // Campo removido da sprint
        public LocalDate getDataNascimento() { return dataNascimento; }
        public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
        public String getGenero() { return genero; }
        public void setGenero(String genero) { this.genero = genero; }
        public List<EnderecoCompletoDto> getEnderecos() { return enderecos; }
        public void setEnderecos(List<EnderecoCompletoDto> enderecos) { this.enderecos = enderecos; }
    }

    public static class EnderecoCompletoDto {
        private Long id;
        private String cep;
        private String logradouro;
        private String numero;
        private String complemento;
        private String bairro;
        private String cidade;
        private String estado;
        private String tipoEndereco;

        // Getters e Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
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
        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }
        public String getTipoEndereco() { return tipoEndereco; }
        public void setTipoEndereco(String tipoEndereco) { this.tipoEndereco = tipoEndereco; }
    }

    public static class AtualizarDadosDto {
        private String nome;
        private String cpf;
        // private String telefone; // Campo removido da sprint
        private LocalDate dataNascimento;
        private String genero;

        // Getters e Setters
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getCpf() { return cpf; }
        public void setCpf(String cpf) { this.cpf = cpf; }
        // public String getTelefone() { return telefone; }
        // public void setTelefone(String telefone) { this.telefone = telefone; } // Campo removido da sprint
        public LocalDate getDataNascimento() { return dataNascimento; }
        public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
        public String getGenero() { return genero; }
        public void setGenero(String genero) { this.genero = genero; }
    }

    public static class AlterarSenhaDto {
        private String senhaAtual;
        private String novaSenha;

        // Getters e Setters
        public String getSenhaAtual() { return senhaAtual; }
        public void setSenhaAtual(String senhaAtual) { this.senhaAtual = senhaAtual; }
        public String getNovaSenha() { return novaSenha; }
        public void setNovaSenha(String novaSenha) { this.novaSenha = novaSenha; }
    }

    public static class NovoEnderecoDto {
        private String cep;
        private String logradouro;
        private String numero;
        private String complemento;
        private String bairro;
        private String cidade;
        private String estado;
        private String tipoEndereco;

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
        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }
        public String getTipoEndereco() { return tipoEndereco; }
        public void setTipoEndereco(String tipoEndereco) { this.tipoEndereco = tipoEndereco; }
    }
}
