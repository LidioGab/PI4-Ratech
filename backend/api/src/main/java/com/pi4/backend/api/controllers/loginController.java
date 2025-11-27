package com.pi4.backend.api.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.services.LoginService;
import com.pi4.backend.api.dto.SessionDto;

@RestController
@CrossOrigin(origins = "*")
public class LoginController {

    private static final Logger log = LoggerFactory.getLogger(LoginController.class);

    @Autowired
    private LoginService loginService; // Injeção do novo Service

    public static class LoginDto {
        private String email;
        private String senha;
        private String senhaHash;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSenha() { return senha; }
        public void setSenha(String senha) { this.senha = senha; }
        public String getSenhaHash() { return senhaHash; }
        public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
    }



    @PostMapping("/api/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        log.debug("Tentativa de login: {}", loginDto.getEmail());

        try {
            SessionDto session = loginService.autenticarUsuario(loginDto.getEmail(), loginDto.getSenha());

            log.info("Login OK: email={} grupo={}", loginDto.getEmail(), session.getGrupo());
            return ResponseEntity.ok(session);

        } catch (RuntimeException e) {
            log.warn("Login falhou para {}: {}", loginDto.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

}
