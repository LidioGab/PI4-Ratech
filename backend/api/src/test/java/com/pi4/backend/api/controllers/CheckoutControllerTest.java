package com.pi4.backend.api.controllers;

import java.math.BigDecimal;
import java.util.Arrays;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.pi4.backend.api.controllers.CheckoutController.CheckoutRequest;
import com.pi4.backend.api.controllers.CheckoutController.ItemCarrinho;
import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.repositories.ClienteRepository;
import com.pi4.backend.api.repositories.ProdutoRepository;
import com.pi4.backend.api.services.FreteService;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do CheckoutController")
class CheckoutControllerTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private FreteService freteService;

    @InjectMocks
    private CheckoutController checkoutController;

    private Cliente cliente;
    private Produto produto;
    private CheckoutRequest checkoutRequest;

    @BeforeEach
    void setUp() {
        // Setup Cliente
        cliente = new Cliente();
        cliente.setId(1);
        cliente.setNome("João Silva");
        cliente.setEmail("joao@teste.com");
        cliente.setStatus(true);

        // Setup Produto
        produto = new Produto();
        produto.setNome("Mouse Gamer");
        produto.setPreco(new BigDecimal("150.00"));
        produto.setQuantidadeEstoque(10);
        produto.setStatus(true);
        
        // Usar reflexão para definir o ID
        try {
            java.lang.reflect.Field idField = Produto.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(produto, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        // Setup CheckoutRequest
        ItemCarrinho item = new ItemCarrinho();
        item.setProdutoId(1L);
        item.setQuantidade(2);
        item.setPrecoUnitario(new BigDecimal("150.00"));

        checkoutRequest = new CheckoutRequest();
        checkoutRequest.setClienteId(1);
        checkoutRequest.setItens(Arrays.asList(item));
        checkoutRequest.setCepEntrega("01310-100");
    }

    @Test
    @DisplayName("Deve iniciar checkout com sucesso")
    void deveIniciarCheckoutComSucesso() {
        // Arrange
        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(freteService.calcularFretePorCep(anyString())).thenReturn(java.util.Map.of("padrao", 15.0));

        // Act
        ResponseEntity<?> response = checkoutController.iniciarCheckout(checkoutRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(clienteRepository, times(1)).findById(1);
        verify(produtoRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Deve retornar erro quando cliente não autenticado")
    void deveRetornarErroQuandoClienteNaoAutenticado() {
        // Arrange
        checkoutRequest.setClienteId(null);

        // Act
        ResponseEntity<?> response = checkoutController.iniciarCheckout(checkoutRequest);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Cliente não autenticado", response.getBody());
        verify(clienteRepository, never()).findById(any());
    }

    @Test
    @DisplayName("Deve retornar erro quando cliente não encontrado")
    void deveRetornarErroQuandoClienteNaoEncontrado() {
        // Arrange
        when(clienteRepository.findById(1)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = checkoutController.iniciarCheckout(checkoutRequest);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Cliente não encontrado", response.getBody());
    }

    @Test
    @DisplayName("Deve retornar erro quando carrinho vazio")
    void deveRetornarErroQuandoCarrinhoVazio() {
        // Arrange
        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));
        checkoutRequest.setItens(Arrays.asList());

        // Act
        ResponseEntity<?> response = checkoutController.iniciarCheckout(checkoutRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Carrinho vazio", response.getBody());
    }

    @Test
    @DisplayName("Deve retornar erro quando produto não encontrado")
    void deveRetornarErroQuandoProdutoNaoEncontrado() {
        // Arrange
        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = checkoutController.iniciarCheckout(checkoutRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Produto não encontrado: 1", response.getBody());
    }

    @Test
    @DisplayName("Deve retornar erro quando estoque insuficiente")
    void deveRetornarErroQuandoEstoqueInsuficiente() {
        // Arrange
        produto.setQuantidadeEstoque(1); // Estoque menor que a quantidade solicitada (2)
        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        // Act
        ResponseEntity<?> response = checkoutController.iniciarCheckout(checkoutRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Estoque insuficiente para: Mouse Gamer", response.getBody());
    }

    @Test
    @DisplayName("Deve retornar erro quando cliente inativo")
    void deveRetornarErroQuandoClienteInativo() {
        // Arrange
        cliente.setStatus(false);
        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));

        // Act
        ResponseEntity<?> response = checkoutController.iniciarCheckout(checkoutRequest);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Cliente inativo", response.getBody());
    }

    @Test
    @DisplayName("Deve retornar erro quando produto inativo")
    void deveRetornarErroQuandoProdutoInativo() {
        // Arrange
        produto.setStatus(false);
        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        // Act
        ResponseEntity<?> response = checkoutController.iniciarCheckout(checkoutRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Produto inativo: Mouse Gamer", response.getBody());
    }

    @Test
    @DisplayName("Deve validar cliente com sucesso")
    void deveValidarClienteComSucesso() {
        // Arrange
        CheckoutController.ValidarClienteRequest request = new CheckoutController.ValidarClienteRequest();
        request.setClienteId(1);
        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));

        // Act
        ResponseEntity<?> response = checkoutController.validarCliente(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(clienteRepository, times(1)).findById(1);
    }
}
