package com.pi4.backend.api.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pi4.backend.api.dto.SessionDto;
import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.entities.Usuario;
import com.pi4.backend.api.repositories.ClienteRepository;
import com.pi4.backend.api.repositories.UserRepository;

@Service
public class LoginService {

    private static final Logger log = LoggerFactory.getLogger(LoginService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String GRUPO_CLIENTE = "Cliente";

    private static final String[] GRUPOS_BACKOFFICE = {"Administrador", "Estoquista"};

    public SessionDto autenticarUsuario(String email, String senha) {
        log.info("Tentativa de login para email: {}", email);

        // Primeiro tenta buscar na tabela de usuários (admins/estoquistas)
        Usuario usuario = userRepository.findByEmail(email);
        log.debug("Usuário encontrado na tabela de usuários: {}", usuario != null);
        
        if (usuario != null) {
            log.debug("Tentando autenticar como usuário administrativo");
            return autenticarUsuarioAdmin(usuario, senha);
        }

        // Se não encontrou na tabela de usuários, busca na tabela de clientes
        Cliente cliente = clienteRepository.findByEmail(email);
        log.debug("Cliente encontrado na tabela de clientes: {}", cliente != null);
        
        if (cliente != null) {
            log.debug("Tentando autenticar como cliente");
            return autenticarCliente(cliente, senha);
        }

        log.warn("Usuário não encontrado em nenhuma tabela: {}", email);
        throw new RuntimeException("Não localizando o sistema deve negar a entrada do usuário no backoffice");
    }

    private SessionDto autenticarUsuarioAdmin(Usuario usuario, String senha) {
        log.debug("Verificando status do usuário: {}", usuario.getStatus());
        if (usuario.getStatus() == null || !usuario.getStatus()) {
            log.warn("Usuário inativo: {}", usuario.getEmail());
            throw new RuntimeException("Usuário inativo");
        }

        log.debug("Verificando senha para usuário: {}", usuario.getEmail());
        log.debug("Senha hash no banco: {}", usuario.getSenha());
        log.debug("Senha informada: {}", senha);
        
        boolean passwordOk = passwordEncoder.matches(senha, usuario.getSenha());
        log.debug("Senha válida: {}", passwordOk);
        
        if (!passwordOk) {
            log.warn("Senha inválida para usuário: {}", usuario.getEmail());
            throw new RuntimeException("Usuário ou senha inválidos");
        }

        String grupo = usuario.getGrupo() != null ? usuario.getGrupo().getNome() : "Usuario";
        log.debug("Grupo do usuário: {}", grupo);
        
        boolean isBackoffice = isGrupoPermitido(grupo, GRUPOS_BACKOFFICE);
        log.debug("É usuário de backoffice: {}", isBackoffice);

        if (isBackoffice) {
            SessionDto session = new SessionDto();
            session.setId(usuario.getId());
            session.setNome(usuario.getNome());
            session.setGrupo(grupo);
            log.info("Login bem-sucedido para usuário administrativo: {} ({})", usuario.getEmail(), grupo);
            return session;
        } else {
            log.warn("Usuário não é de backoffice: {} ({})", usuario.getEmail(), grupo);
            throw new RuntimeException("Esta tela de login é apenas para usuários de backoffice");
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
