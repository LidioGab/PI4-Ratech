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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.pi4.backend.api.controllers.CarrinhoController.AdicionarItemRequest;
import com.pi4.backend.api.controllers.CarrinhoController.AtualizarQuantidadeRequest;
import com.pi4.backend.api.entities.CarrinhoItem;
import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.repositories.CarrinhoRepository;
import com.pi4.backend.api.repositories.ClienteRepository;
import com.pi4.backend.api.repositories.ProdutoRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do CarrinhoController")
class CarrinhoControllerTest {

    @Mock
    private CarrinhoRepository carrinhoRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @InjectMocks
    private CarrinhoController carrinhoController;

    private Cliente cliente;
    private Produto produto;
    private CarrinhoItem carrinhoItem;

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

        // Setup CarrinhoItem
        carrinhoItem = new CarrinhoItem(cliente, produto, 2);
    }

    @Test
    @DisplayName("Deve obter carrinho do cliente com sucesso")
    void deveObterCarrinhoComSucesso() {
        // Arrange
        when(clienteRepository.existsById(1)).thenReturn(true);
        when(carrinhoRepository.findByClienteId(1)).thenReturn(Arrays.asList(carrinhoItem));

        // Act
        ResponseEntity<?> response = carrinhoController.obterCarrinho(1);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(carrinhoRepository, times(1)).findByClienteId(1);
    }

    @Test
    @DisplayName("Deve retornar erro quando cliente não encontrado ao obter carrinho")
    void deveRetornarErroClienteNaoEncontradoObterCarrinho() {
        // Arrange
        when(clienteRepository.existsById(1)).thenReturn(false);

        // Act
        ResponseEntity<?> response = carrinhoController.obterCarrinho(1);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Cliente não encontrado", response.getBody());
        verify(carrinhoRepository, never()).findByClienteId(any());
    }

    @Test
    @DisplayName("Deve adicionar item ao carrinho com sucesso")
    void deveAdicionarItemComSucesso() {
        // Arrange
        AdicionarItemRequest request = new AdicionarItemRequest();
        request.setClienteId(1);
        request.setProdutoId(1L);
        request.setQuantidade(2);

        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(carrinhoRepository.findByClienteIdAndProdutoId(1, 1L)).thenReturn(null);
        when(carrinhoRepository.save(any(CarrinhoItem.class))).thenReturn(carrinhoItem);

        // Act
        ResponseEntity<?> response = carrinhoController.adicionarItem(request);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(carrinhoRepository, times(1)).save(any(CarrinhoItem.class));
    }

    @Test
    @DisplayName("Deve retornar erro quando cliente ID é nulo")
    void deveRetornarErroClienteIdNulo() {
        // Arrange
        AdicionarItemRequest request = new AdicionarItemRequest();
        request.setClienteId(null);
        request.setProdutoId(1L);
        request.setQuantidade(2);

        // Act
        ResponseEntity<?> response = carrinhoController.adicionarItem(request);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Cliente ID é obrigatório", response.getBody());
    }

    @Test
    @DisplayName("Deve retornar erro quando produto ID é nulo")
    void deveRetornarErroProdutoIdNulo() {
        // Arrange
        AdicionarItemRequest request = new AdicionarItemRequest();
        request.setClienteId(1);
        request.setProdutoId(null);
        request.setQuantidade(2);

        // Act
        ResponseEntity<?> response = carrinhoController.adicionarItem(request);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Produto ID é obrigatório", response.getBody());
    }

    @Test
    @DisplayName("Deve retornar erro quando quantidade é zero ou negativa")
    void deveRetornarErroQuantidadeInvalida() {
        // Arrange
        AdicionarItemRequest request = new AdicionarItemRequest();
        request.setClienteId(1);
        request.setProdutoId(1L);
        request.setQuantidade(0);

        // Act
        ResponseEntity<?> response = carrinhoController.adicionarItem(request);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Quantidade deve ser maior que zero", response.getBody());
    }

    @Test
    @DisplayName("Deve retornar erro quando estoque insuficiente")
    void deveRetornarErroEstoqueInsuficiente() {
        // Arrange
        produto.setQuantidadeEstoque(1); // Estoque menor que quantidade solicitada
        
        AdicionarItemRequest request = new AdicionarItemRequest();
        request.setClienteId(1);
        request.setProdutoId(1L);
        request.setQuantidade(5);

        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        // Act
        ResponseEntity<?> response = carrinhoController.adicionarItem(request);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Estoque insuficiente", response.getBody());
    }

    @Test
    @DisplayName("Deve atualizar quantidade existente no carrinho")
    void deveAtualizarQuantidadeExistente() {
        // Arrange
        AdicionarItemRequest request = new AdicionarItemRequest();
        request.setClienteId(1);
        request.setProdutoId(1L);
        request.setQuantidade(3);

        CarrinhoItem itemExistente = new CarrinhoItem(cliente, produto, 2);

        when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(carrinhoRepository.findByClienteIdAndProdutoId(1, 1L)).thenReturn(itemExistente);
        when(carrinhoRepository.save(any(CarrinhoItem.class))).thenReturn(itemExistente);

        // Act
        ResponseEntity<?> response = carrinhoController.adicionarItem(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(5, itemExistente.getQuantidade()); // 2 + 3
        verify(carrinhoRepository, times(1)).save(itemExistente);
    }

    @Test
    @DisplayName("Deve remover item do carrinho com sucesso")
    void deveRemoverItemComSucesso() {
        // Arrange
        when(carrinhoRepository.findByClienteIdAndProdutoId(1, 1L)).thenReturn(carrinhoItem);

        // Act
        ResponseEntity<?> response = carrinhoController.removerItem(1, 1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Item removido do carrinho", response.getBody());
        verify(carrinhoRepository, times(1)).delete(carrinhoItem);
    }

    @Test
    @DisplayName("Deve atualizar quantidade de item existente")
    void deveAtualizarQuantidadeItem() {
        // Arrange
        AtualizarQuantidadeRequest request = new AtualizarQuantidadeRequest();
        request.setQuantidade(5);

        when(carrinhoRepository.findByClienteIdAndProdutoId(1, 1L)).thenReturn(carrinhoItem);
        when(carrinhoRepository.save(carrinhoItem)).thenReturn(carrinhoItem);

        // Act
        ResponseEntity<?> response = carrinhoController.atualizarQuantidade(1, 1L, request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(5, carrinhoItem.getQuantidade());
        verify(carrinhoRepository, times(1)).save(carrinhoItem);
    }

    @Test
    @DisplayName("Deve limpar carrinho com sucesso")
    void deveLimparCarrinhoComSucesso() {
        // Arrange
        when(clienteRepository.existsById(1)).thenReturn(true);

        // Act
        ResponseEntity<?> response = carrinhoController.limparCarrinho(1);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Carrinho limpo", response.getBody());
        verify(carrinhoRepository, times(1)).deleteByClienteId(1);
    }

    @Test
    @DisplayName("Deve contar itens do carrinho")
    void deveContarItens() {
        // Arrange
        when(clienteRepository.existsById(1)).thenReturn(true);
        when(carrinhoRepository.getTotalItemsByClienteId(1)).thenReturn(5);

        // Act
        ResponseEntity<?> response = carrinhoController.contarItens(1);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(5, response.getBody());
        verify(carrinhoRepository, times(1)).getTotalItemsByClienteId(1);
    }
}
