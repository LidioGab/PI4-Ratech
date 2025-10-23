package com.pi4.backend.api.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pi4.backend.api.controllers.LoginController.SessionDto;
import com.pi4.backend.api.entities.Usuario;
import com.pi4.backend.api.repositories.UserRepository;
import java.util.Objects;

@Service
public class LoginService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String GRUPO_CLIENTE = "Cliente";

    private static final String[] GRUPOS_BACKOFFICE = {"Administrador", "Estoquista"};

    public SessionDto autenticarUsuario(String email, String senha) {

        Usuario usuario = userRepository.findByEmail(email);

        if (usuario == null) {
            throw new RuntimeException("Usuário ou senha inválidos");
        }

        if (usuario.getStatus() == null || !usuario.getStatus()) {
            throw new RuntimeException("Usuário inativo");
        }

        boolean passwordOk = passwordEncoder.matches(senha, usuario.getSenha());
        if (!passwordOk) {
            throw new RuntimeException("Usuário ou senha inválidos");
        }

        String grupo = usuario.getGrupo() != null ? usuario.getGrupo().getNome() : GRUPO_CLIENTE;


        boolean isBackoffice = isGrupoPermitido(grupo, GRUPOS_BACKOFFICE);

        if (GRUPO_CLIENTE.equalsIgnoreCase(grupo) || isBackoffice) {

            SessionDto session = new SessionDto();
            session.setId(usuario.getId());
            session.setNome(usuario.getNome());
            session.setGrupo(grupo);
            return session;
        } else {
            throw new RuntimeException("Acesso negado. Grupo não reconhecido.");
        }
    }

    private boolean isGrupoPermitido(String grupo, String[] gruposPermitidos) {
        if (grupo == null) return false;
        for (String permitido : gruposPermitidos) {
            if (permitido.equalsIgnoreCase(grupo)) {
                return true;
            }
        }
        return false;
    }
}