package com.pi4.backend.api.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.Usuario;
import com.pi4.backend.api.repositories.UserRepository;

@RestController
@CrossOrigin(origins = "*")
public class loginController {

    private static final Logger log = LoggerFactory.getLogger(loginController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        log.debug("Tentativa login email={} ", loginDto.getEmail());
        Usuario usuario = userRepository.findByEmail(loginDto.getEmail());
        if (usuario == null) {
            log.warn("Login falhou - usuario não encontrado: {}", loginDto.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha inválidos");
        }
        if (usuario.getStatus() == null || !usuario.getStatus()) {
            log.warn("Login falhou - usuario inativo: {}", loginDto.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário inativo");
        }
        String grupo = usuario.getGrupo().getNome();
        if (!("Administrador".equalsIgnoreCase(grupo) || "Estoquista".equalsIgnoreCase(grupo))) {
            log.warn("Login falhou - grupo não autorizado: {} grupo={} ", loginDto.getEmail(), grupo);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Acesso negado ao backoffice");
        }
        boolean passwordOk = false;
        try {
            // Estratégia: se senhaHash (SHA-256 no frontend) for enviada, tentamos comparar bcrypt armazenado com a senha original.
            // Como não temos a senha original, fazemos fallback para comparar usando o valor plano recebido.
            // Caso futuro: armazenar também hash SHA-256(bcrypt) permitiria double-hash.
            if (loginDto.getSenha() != null) {
                passwordOk = passwordEncoder.matches(loginDto.getSenha(), usuario.getSenha());
            }
            // Se envio incluir senhaHash mas comparação com senha falhou, podemos tentar heurística: gerar SHA-256 local da string candidata? (não aplicável sem original)
        } catch (Exception e) {
            log.error("Erro comparando senha", e);
        }
        if (!passwordOk) {
            log.warn("Login falhou - senha incorreta para {}", loginDto.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha inválidos");
        }

        // Simples resposta de sessão
        SessionDto session = new SessionDto();
        session.setId(usuario.getId());
        session.setNome(usuario.getNome());
        session.setGrupo(grupo);
        log.info("Login OK email={} grupo={}", loginDto.getEmail(), grupo);
        return ResponseEntity.ok(session);
    }

    public static class LoginDto {
        private String email;
        private String senha; // plaintext (para compatibilidade)
        private String senhaHash; // SHA-256 produzido no frontend
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSenha() { return senha; }
        public void setSenha(String senha) { this.senha = senha; }
        public String getSenhaHash() { return senhaHash; }
        public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
    }

    public static class SessionDto {
        private Integer id;
        private String nome;
        private String grupo;
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getGrupo() { return grupo; }
        public void setGrupo(String grupo) { this.grupo = grupo; }
    }
}
