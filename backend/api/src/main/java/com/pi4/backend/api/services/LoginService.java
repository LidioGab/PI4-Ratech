package com.pi4.backend.api.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pi4.backend.api.controllers.loginController.SessionDto;
import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.entities.Usuario;
import com.pi4.backend.api.repositories.ClienteRepository;
import com.pi4.backend.api.repositories.UserRepository;

@Service
public class LoginService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String GRUPO_CLIENTE = "Cliente";

    private static final String[] GRUPOS_BACKOFFICE = {"Administrador", "Estoquista"};

    public SessionDto autenticarUsuario(String email, String senha) {

        // Primeiro tenta buscar na tabela de usuários (admins/estoquistas)
        Usuario usuario = userRepository.findByEmail(email);
        
        if (usuario != null) {
            return autenticarUsuarioAdmin(usuario, senha);
        }

        // Se não encontrou na tabela de usuários, busca na tabela de clientes
        Cliente cliente = clienteRepository.findByEmail(email);
        
        if (cliente != null) {
            return autenticarCliente(cliente, senha);
        }

        throw new RuntimeException("Usuário ou senha inválidos");
    }

    private SessionDto autenticarUsuarioAdmin(Usuario usuario, String senha) {
        if (usuario.getStatus() == null || !usuario.getStatus()) {
            throw new RuntimeException("Usuário inativo");
        }

        boolean passwordOk = passwordEncoder.matches(senha, usuario.getSenha());
        if (!passwordOk) {
            throw new RuntimeException("Usuário ou senha inválidos");
        }

        String grupo = usuario.getGrupo() != null ? usuario.getGrupo().getNome() : "Usuario";
        boolean isBackoffice = isGrupoPermitido(grupo, GRUPOS_BACKOFFICE);

        if (isBackoffice) {
            SessionDto session = new SessionDto();
            session.setId(usuario.getId());
            session.setNome(usuario.getNome());
            session.setGrupo(grupo);
            return session;
        } else {
            throw new RuntimeException("Acesso negado. Grupo não reconhecido.");
        }
    }

    private SessionDto autenticarCliente(Cliente cliente, String senha) {
        if (cliente.getStatus() == null || !cliente.getStatus()) {
            throw new RuntimeException("Cliente inativo");
        }

        boolean passwordOk = passwordEncoder.matches(senha, cliente.getSenha());
        if (!passwordOk) {
            throw new RuntimeException("Usuário ou senha inválidos");
        }

        SessionDto session = new SessionDto();
        session.setId(cliente.getId());
        session.setNome(cliente.getNome());
        session.setGrupo(GRUPO_CLIENTE);
        return session;
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
