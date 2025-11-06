package com.pi4.backend.api.services;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pi4.backend.api.controllers.loginController.SessionDto;
import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.entities.Grupo;
import com.pi4.backend.api.entities.Usuario;
import com.pi4.backend.api.repositories.ClienteRepository;
import com.pi4.backend.api.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do LoginService")
class LoginServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private LoginService loginService;

    private Usuario usuarioAdmin;
    private Usuario usuarioEstoquista;
    private Cliente cliente;
    private Grupo grupoAdmin;
    private Grupo grupoEstoquista;

    @BeforeEach
    void setUp() {
        // Setup Grupo Admin
        grupoAdmin = new Grupo();
        grupoAdmin.setId(1);
        grupoAdmin.setNome("Administrador");

        // Setup Grupo Estoquista
        grupoEstoquista = new Grupo();
        grupoEstoquista.setId(2);
        grupoEstoquista.setNome("Estoquista");

        // Setup Usuario Admin
        usuarioAdmin = new Usuario();
        usuarioAdmin.setId(1);
        usuarioAdmin.setNome("Admin Teste");
        usuarioAdmin.setEmail("admin@test.com");
        usuarioAdmin.setSenha("$2a$10$hashedPassword");
        usuarioAdmin.setStatus(true);
        usuarioAdmin.setGrupo(grupoAdmin);

        // Setup Usuario Estoquista
        usuarioEstoquista = new Usuario();
        usuarioEstoquista.setId(2);
        usuarioEstoquista.setNome("Estoquista Teste");
        usuarioEstoquista.setEmail("estoquista@test.com");
        usuarioEstoquista.setSenha("$2a$10$hashedPassword");
        usuarioEstoquista.setStatus(true);
        usuarioEstoquista.setGrupo(grupoEstoquista);

        // Setup Cliente
        cliente = new Cliente();
        cliente.setId(1);
        cliente.setNome("Cliente Teste");
        cliente.setEmail("cliente@test.com");
        cliente.setSenha("$2a$10$hashedPassword");
        cliente.setStatus(true);
        cliente.setCpf("123.456.789-00");
        cliente.setDataNascimento(LocalDate.of(1990, 1, 1));
        cliente.setGenero(Cliente.Genero.MASCULINO);
    }

    @Test
    @DisplayName("Deve autenticar usuário administrador com sucesso")
    void deveAutenticarUsuarioAdministradorComSucesso() {
        // Arrange
        when(userRepository.findByEmail("admin@test.com")).thenReturn(usuarioAdmin);
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // Act
        SessionDto session = loginService.autenticarUsuario("admin@test.com", "senha123");

        // Assert
        assertNotNull(session);
        assertEquals(1, session.getId());
        assertEquals("Admin Teste", session.getNome());
        assertEquals("Administrador", session.getGrupo());
        
        verify(userRepository, times(1)).findByEmail("admin@test.com");
        verify(passwordEncoder, times(1)).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("Deve autenticar usuário estoquista com sucesso")
    void deveAutenticarUsuarioEstoquistaComSucesso() {
        // Arrange
        when(userRepository.findByEmail("estoquista@test.com")).thenReturn(usuarioEstoquista);
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // Act
        SessionDto session = loginService.autenticarUsuario("estoquista@test.com", "senha123");

        // Assert
        assertNotNull(session);
        assertEquals(2, session.getId());
        assertEquals("Estoquista Teste", session.getNome());
        assertEquals("Estoquista", session.getGrupo());
    }

    @Test
    @DisplayName("Deve autenticar cliente com sucesso")
    void deveAutenticarClienteComSucesso() {
        // Arrange
        when(userRepository.findByEmail("cliente@test.com")).thenReturn(null);
        when(clienteRepository.findByEmail("cliente@test.com")).thenReturn(cliente);
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // Act
        SessionDto session = loginService.autenticarUsuario("cliente@test.com", "senha123");

        // Assert
        assertNotNull(session);
        assertEquals(1, session.getId());
        assertEquals("Cliente Teste", session.getNome());
        assertEquals("Cliente", session.getGrupo());
        
        verify(userRepository, times(1)).findByEmail("cliente@test.com");
        verify(clienteRepository, times(1)).findByEmail("cliente@test.com");
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário não encontrado")
    void deveLancarExcecaoQuandoUsuarioNaoEncontrado() {
        // Arrange
        when(userRepository.findByEmail("inexistente@test.com")).thenReturn(null);
        when(clienteRepository.findByEmail("inexistente@test.com")).thenReturn(null);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            loginService.autenticarUsuario("inexistente@test.com", "senha123");
        });

        assertEquals("Usuário ou senha inválidos", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar exceção quando senha incorreta para usuário")
    void deveLancarExcecaoQuandoSenhaIncorretaParaUsuario() {
        // Arrange
        when(userRepository.findByEmail("admin@test.com")).thenReturn(usuarioAdmin);
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            loginService.autenticarUsuario("admin@test.com", "senhaErrada");
        });

        assertEquals("Usuário ou senha inválidos", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar exceção quando senha incorreta para cliente")
    void deveLancarExcecaoQuandoSenhaIncorretaParaCliente() {
        // Arrange
        when(userRepository.findByEmail("cliente@test.com")).thenReturn(null);
        when(clienteRepository.findByEmail("cliente@test.com")).thenReturn(cliente);
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            loginService.autenticarUsuario("cliente@test.com", "senhaErrada");
        });

        assertEquals("Usuário ou senha inválidos", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário está inativo")
    void deveLancarExcecaoQuandoUsuarioInativo() {
        // Arrange
        usuarioAdmin.setStatus(false);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(usuarioAdmin);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            loginService.autenticarUsuario("admin@test.com", "senha123");
        });

        assertEquals("Usuário inativo", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar exceção quando cliente está inativo")
    void deveLancarExcecaoQuandoClienteInativo() {
        // Arrange
        cliente.setStatus(false);
        when(userRepository.findByEmail("cliente@test.com")).thenReturn(null);
        when(clienteRepository.findByEmail("cliente@test.com")).thenReturn(cliente);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            loginService.autenticarUsuario("cliente@test.com", "senha123");
        });

        assertEquals("Cliente inativo", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar exceção quando grupo não é permitido")
    void deveLancarExcecaoQuandoGrupoNaoPermitido() {
        // Arrange
        Grupo grupoInvalido = new Grupo();
        grupoInvalido.setId(3);
        grupoInvalido.setNome("GrupoInvalido");
        usuarioAdmin.setGrupo(grupoInvalido);

        when(userRepository.findByEmail("admin@test.com")).thenReturn(usuarioAdmin);
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            loginService.autenticarUsuario("admin@test.com", "senha123");
        });

        assertEquals("Acesso negado. Grupo não reconhecido.", exception.getMessage());
    }
}
