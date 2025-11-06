package com.pi4.backend.api.controllers;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pi4.backend.api.controllers.ClienteController.AlterarSenhaDto;
import com.pi4.backend.api.controllers.ClienteController.AtualizarDadosDto;
import com.pi4.backend.api.controllers.ClienteController.CadastroClienteDto;
import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.repositories.ClienteRepository;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Testes do ClienteController")
class ClienteControllerTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ClienteController clienteController;

    private Cliente cliente;

    @BeforeEach
    void setUp() {
        cliente = new Cliente();
        cliente.setId(1);
        cliente.setNome("João Silva Santos");
        cliente.setEmail("joao@teste.com");
        cliente.setCpf("123.456.789-00");
        cliente.setSenha("$2a$10$encodedPassword");
        cliente.setDataNascimento(LocalDate.of(1990, 1, 1));
        cliente.setGenero(Cliente.Genero.MASCULINO);
        cliente.setStatus(true);
        cliente.setEnderecos(new ArrayList<>());
    }

    @Test
    @DisplayName("Deve buscar cliente por ID com sucesso")
    void deveBuscarClientePorIdComSucesso() {
        // Arrange
        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));

        // Act
        ResponseEntity<?> response = clienteController.buscarCliente(1);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(clienteRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Deve retornar 404 quando cliente não encontrado")
    void deveRetornar404QuandoClienteNaoEncontrado() {
        // Arrange
        when(clienteRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = clienteController.buscarCliente(999);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve atualizar dados do cliente")
    void deveAtualizarDadosCliente() {
        // Arrange
        AtualizarDadosDto alterarDto = new AtualizarDadosDto();
        alterarDto.setNome("João Silva Santos Atualizado");

        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));
        when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);

        // Act
        ResponseEntity<?> response = clienteController.atualizarDadosPessoais(1, alterarDto);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(clienteRepository, times(1)).save(any(Cliente.class));
    }

    @Test
    @DisplayName("Deve alterar senha do cliente")
    void deveAlterarSenhaCliente() {
        // Arrange
        AlterarSenhaDto senhaDto = new AlterarSenhaDto();
        senhaDto.setSenhaAtual("senha123");
        senhaDto.setNovaSenha("novaSenha123");

        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);

        // Act
        ResponseEntity<?> response = clienteController.alterarSenha(1, senhaDto);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(clienteRepository, times(1)).save(any(Cliente.class));
    }

    @Test
    @DisplayName("Deve retornar erro quando senha atual incorreta")
    void deveRetornarErroSenhaAtualIncorreta() {
        // Arrange
        AlterarSenhaDto senhaDto = new AlterarSenhaDto();
        senhaDto.setSenhaAtual("senhaErrada");
        senhaDto.setNovaSenha("novaSenha123");

        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act
        ResponseEntity<?> response = clienteController.alterarSenha(1, senhaDto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    @DisplayName("Deve validar email duplicado no cadastro")
    void deveValidarEmailDuplicado() {
        // Arrange
        CadastroClienteDto dto = new CadastroClienteDto();
        dto.setNome("João Silva Santos");
        dto.setCpf("123.456.789-00");
        dto.setEmail("joao@teste.com");
        dto.setSenha("senha123");
        dto.setConfirmacaoSenha("senha123");
        
        when(clienteRepository.existsByCpf(anyString())).thenReturn(false);
        when(clienteRepository.existsByEmail(anyString())).thenReturn(true);

        // Act
        ResponseEntity<?> response = clienteController.cadastrarCliente(dto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    @DisplayName("Deve validar CPF duplicado no cadastro")
    void deveValidarCpfDuplicado() {
        // Arrange
        CadastroClienteDto dto = new CadastroClienteDto();
        dto.setNome("João Silva Santos");
        dto.setCpf("123.456.789-00");
        dto.setEmail("joao@teste.com");
        dto.setSenha("senha123");
        dto.setConfirmacaoSenha("senha123");
        
        when(clienteRepository.existsByCpf(anyString())).thenReturn(true);

        // Act
        ResponseEntity<?> response = clienteController.cadastrarCliente(dto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(clienteRepository, never()).save(any(Cliente.class));
    }
}
