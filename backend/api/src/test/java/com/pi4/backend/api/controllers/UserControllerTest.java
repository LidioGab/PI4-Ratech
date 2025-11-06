package com.pi4.backend.api.controllers;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pi4.backend.api.controllers.UserController.AlterarSenhaDto;
import com.pi4.backend.api.controllers.UserController.AtualizarUsuarioDto;
import com.pi4.backend.api.controllers.UserController.CriarUsuarioDto;
import com.pi4.backend.api.entities.Grupo;
import com.pi4.backend.api.entities.Usuario;
import com.pi4.backend.api.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do UserController")
class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserController userController;

    private Usuario usuario;
    private Grupo grupo;

    @BeforeEach
    void setUp() {
        grupo = new Grupo();
        grupo.setId(1);
        grupo.setNome("Administrador");

        usuario = new Usuario();
        usuario.setId(1);
        usuario.setNome("Admin User");
        usuario.setEmail("admin@teste.com");
        usuario.setCpf("123.456.789-00");
        usuario.setSenha("$2a$10$encodedPassword");
        usuario.setGrupo(grupo);
        usuario.setStatus(true);
    }

    @Test
    @DisplayName("Deve listar todos os usuários")
    void deveListarTodosUsuarios() {
        // Arrange
        List<Usuario> usuarios = Arrays.asList(usuario);
        when(userRepository.findAll()).thenReturn(usuarios);

        // Act
        List<Usuario> response = userController.listar();

        // Assert
        assertNotNull(response);
        assertFalse(response.isEmpty());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve buscar usuário por ID com sucesso")
    void deveBuscarUsuarioPorIdComSucesso() {
        // Arrange
        when(userRepository.findById(1)).thenReturn(Optional.of(usuario));

        // Act
        ResponseEntity<?> response = userController.obter(1);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Deve retornar 404 quando usuário não encontrado")
    void deveRetornar404QuandoUsuarioNaoEncontrado() {
        // Arrange
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = userController.obter(999);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve atualizar usuário com sucesso")
    void deveAtualizarUsuarioComSucesso() {
        // Arrange
        AtualizarUsuarioDto dto = new AtualizarUsuarioDto();
        dto.setNome("Admin User Atualizado");

        when(userRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(userRepository.save(any(Usuario.class))).thenReturn(usuario);

        // Act
        ResponseEntity<?> response = userController.atualizar(1, dto);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Deve retornar 404 ao atualizar usuário inexistente")
    void deveRetornar404AoAtualizarUsuarioInexistente() {
        // Arrange
        AtualizarUsuarioDto dto = new AtualizarUsuarioDto();
        dto.setNome("Novo Nome");
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = userController.atualizar(999, dto);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(userRepository, never()).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Deve alterar senha do usuário")
    void deveAlterarSenhaUsuario() {
        // Arrange
        AlterarSenhaDto dto = new AlterarSenhaDto();
        dto.setNovaSenha("novaSenha123");
        dto.setConfirmacao("novaSenha123");

        when(userRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$newEncodedPassword");
        when(userRepository.save(any(Usuario.class))).thenReturn(usuario);

        // Act
        ResponseEntity<?> response = userController.alterarSenha(1, dto);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Deve alternar status do usuário")
    void deveAlternarStatusUsuario() {
        // Arrange
        when(userRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(userRepository.save(any(Usuario.class))).thenReturn(usuario);

        // Act
        ResponseEntity<?> response = userController.alterarStatus(1);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Deve validar email duplicado")
    void deveValidarEmailDuplicado() {
        // Arrange
        CriarUsuarioDto dto = new CriarUsuarioDto();
        dto.setNome("Novo Admin");
        dto.setEmail("admin@teste.com");
        dto.setCpf("987.654.321-00");
        dto.setSenha("senha123");
        dto.setConfirmacaoSenha("senha123");
        dto.setGrupo("Administrador");

        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act
        ResponseEntity<?> response = userController.criar(dto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(userRepository, never()).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Deve validar CPF duplicado")
    void deveValidarCpfDuplicado() {
        // Arrange
        CriarUsuarioDto dto = new CriarUsuarioDto();
        dto.setNome("Novo Admin");
        dto.setEmail("novo@teste.com");
        dto.setCpf("123.456.789-00");
        dto.setSenha("senha123");
        dto.setConfirmacaoSenha("senha123");
        dto.setGrupo("Administrador");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByCpf(anyString())).thenReturn(true);

        // Act
        ResponseEntity<?> response = userController.criar(dto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(userRepository, never()).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Deve validar CPF inválido")
    void deveValidarCpfInvalido() {
        // Arrange
        CriarUsuarioDto dto = new CriarUsuarioDto();
        dto.setNome("Novo Admin");
        dto.setEmail("novo@teste.com");
        dto.setCpf("123456789");
        dto.setSenha("senha123");
        dto.setConfirmacaoSenha("senha123");
        dto.setGrupo("Administrador");

        // Act
        ResponseEntity<?> response = userController.criar(dto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(userRepository, never()).save(any(Usuario.class));
    }
}
