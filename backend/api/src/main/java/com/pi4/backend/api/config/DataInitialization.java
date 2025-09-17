package com.pi4.backend.api.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pi4.backend.api.entities.Usuario;
import com.pi4.backend.api.repositories.UserRepository;

@Configuration
public class DataInitialization {

    @Bean
    CommandLineRunner ensureSeedUsersHashed(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            fixUserPassword(userRepository, passwordEncoder,
                    "admin@ratech.com", "Admin@123");
            fixUserPassword(userRepository, passwordEncoder,
                    "estoquista@ratech.com", "Estoque@123");
        };
    }

    private void fixUserPassword(UserRepository repo, PasswordEncoder encoder, String email, String plainDesired) {
        Usuario u = repo.findByEmail(email);
        if (u == null) return; // not present
    // Ambiente de desenvolvimento: sempre garantir senha conhecida
        u.setSenha(encoder.encode(plainDesired));
        repo.save(u);
    }
}
