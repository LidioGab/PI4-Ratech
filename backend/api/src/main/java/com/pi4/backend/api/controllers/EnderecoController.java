package com.pi4.backend.api.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.Endereco;
import com.pi4.backend.api.entities.Usuario;
import com.pi4.backend.api.repositories.EnderecoRepository;
import com.pi4.backend.api.repositories.UserRepository;

@RestController
@RequestMapping("/users/{userId}/enderecos")
public class EnderecoController {

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> listar(@PathVariable Integer userId) {
        if (!userRepository.existsById(userId)) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        List<Endereco> lista = enderecoRepository.findByUsuarioId(userId);
        return ResponseEntity.ok(lista);
    }

    // DTO simplificado para criação
    public static class CriarEnderecoDto {
        public String cep;
        public String logradouro;
        public String numero;
        public String complemento;
        public String bairro;
        public String cidade;
        public String uf;
        public String nomeRecebedor;
    }

    @PostMapping
    public ResponseEntity<?> criar(@PathVariable Integer userId, @RequestBody CriarEnderecoDto dto) {
        Optional<Usuario> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        // Validações básicas
        if (dto.cep == null || dto.logradouro == null || dto.numero == null || dto.bairro == null || dto.cidade == null || dto.uf == null || dto.nomeRecebedor == null) {
            return ResponseEntity.badRequest().body("Preencha todos os campos obrigatórios");
        }
        // Validar CEP via viacep
        try {
            String cepClean = dto.cep.replaceAll("[^0-9]", "");
            org.springframework.web.client.RestTemplate rt = new org.springframework.web.client.RestTemplate();
            String url = "https://viacep.com.br/ws/" + cepClean + "/json/";
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> cepResp = rt.getForObject(url, java.util.Map.class);
            if (cepResp == null || cepResp.containsKey("erro")) {
                return ResponseEntity.badRequest().body("CEP inválido");
            }
            // preencher campos faltantes a partir da resposta (se não informados)
            if (dto.logradouro == null || dto.logradouro.isEmpty()) dto.logradouro = (String) cepResp.getOrDefault("logradouro", dto.logradouro);
            if (dto.bairro == null || dto.bairro.isEmpty()) dto.bairro = (String) cepResp.getOrDefault("bairro", dto.bairro);
            if (dto.cidade == null || dto.cidade.isEmpty()) dto.cidade = (String) cepResp.getOrDefault("localidade", dto.cidade);
            if (dto.uf == null || dto.uf.isEmpty()) dto.uf = (String) cepResp.getOrDefault("uf", dto.uf);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro consultando serviço de CEP");
        }
        Usuario u = opt.get();
        Endereco e = new Endereco();
        e.setUsuario(u);
        e.setCep(dto.cep);
        e.setLogradouro(dto.logradouro);
        e.setNumero(dto.numero);
        e.setComplemento(dto.complemento);
        e.setBairro(dto.bairro);
        e.setCidade(dto.cidade);
        e.setUf(dto.uf);
        e.setNomeRecebedor(dto.nomeRecebedor);
        // Se for o primeiro endereço, marcar como padrão
        boolean temOutro = !enderecoRepository.findByUsuarioId(userId).isEmpty();
        if (!temOutro) e.setEnderecoPadrao(true);
        Endereco salvo = enderecoRepository.save(e);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PostMapping("/{enderecoId}/default")
    public ResponseEntity<?> setDefault(@PathVariable Integer userId, @PathVariable Integer enderecoId) {
        Optional<Usuario> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        Optional<Endereco> edOpt = enderecoRepository.findById(enderecoId);
        if (edOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Endereço não encontrado");
        Endereco novoPadrao = edOpt.get();
        if (novoPadrao.getUsuario() == null || !novoPadrao.getUsuario().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Endereço não pertence ao usuário");
        }
        // Tirar padrão de outros
        List<Endereco> todos = enderecoRepository.findByUsuarioId(userId);
        for (Endereco x : todos) {
            if (Boolean.TRUE.equals(x.getEnderecoPadrao())) {
                x.setEnderecoPadrao(false);
                enderecoRepository.save(x);
            }
        }
        novoPadrao.setEnderecoPadrao(true);
        enderecoRepository.save(novoPadrao);
        return ResponseEntity.ok("Endereço padrão atualizado");
    }

    // ATUALIZAR ENDEREÇO
    @PutMapping("/{enderecoId}")
    public ResponseEntity<?> atualizarEndereco(@PathVariable Integer userId, @PathVariable Integer enderecoId, @RequestBody CriarEnderecoDto dto) {
        Optional<Usuario> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        Optional<Endereco> edOpt = enderecoRepository.findById(enderecoId);
        if (edOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Endereço não encontrado");
        Endereco e = edOpt.get();
        if (e.getUsuario() == null || !e.getUsuario().getId().equals(userId)) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Endereço não pertence ao usuário");
        // validar campos básicos
        if (dto.cep == null || dto.logradouro == null || dto.numero == null || dto.bairro == null || dto.cidade == null || dto.uf == null || dto.nomeRecebedor == null) {
            return ResponseEntity.badRequest().body("Preencha todos os campos obrigatórios");
        }
        // opcional: validar CEP via viacep (re-uso mesma lógica)
        try {
            String cepClean = dto.cep.replaceAll("[^0-9]", "");
            org.springframework.web.client.RestTemplate rt = new org.springframework.web.client.RestTemplate();
            String url = "https://viacep.com.br/ws/" + cepClean + "/json/";
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> cepResp = rt.getForObject(url, java.util.Map.class);
            if (cepResp == null || cepResp.containsKey("erro")) {
                return ResponseEntity.badRequest().body("CEP inválido");
            }
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro consultando serviço de CEP");
        }
        e.setCep(dto.cep);
        e.setLogradouro(dto.logradouro);
        e.setNumero(dto.numero);
        e.setComplemento(dto.complemento);
        e.setBairro(dto.bairro);
        e.setCidade(dto.cidade);
        e.setUf(dto.uf);
        e.setNomeRecebedor(dto.nomeRecebedor);
        enderecoRepository.save(e);
        return ResponseEntity.ok(e);
    }

    // REMOVER ENDEREÇO
    @DeleteMapping("/{enderecoId}")
    public ResponseEntity<?> deletarEndereco(@PathVariable Integer userId, @PathVariable Integer enderecoId) {
        Optional<Usuario> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        Optional<Endereco> edOpt = enderecoRepository.findById(enderecoId);
        if (edOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Endereço não encontrado");
        Endereco e = edOpt.get();
        if (e.getUsuario() == null || !e.getUsuario().getId().equals(userId)) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Endereço não pertence ao usuário");
        enderecoRepository.delete(e);
        return ResponseEntity.ok("Endereço removido");
    }
}
