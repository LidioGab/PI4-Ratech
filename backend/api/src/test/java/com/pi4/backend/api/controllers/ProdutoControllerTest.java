package com.pi4.backend.api.controllers;

import java.lang.reflect.Field;
import java.math.BigDecimal;
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
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.repositories.ProdutoRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ProdutoController")
class ProdutoControllerTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @InjectMocks
    private ProdutoController produtoController;

    private Produto produto;

    @BeforeEach
    void setUp() {
        produto = new Produto();
        try {
            Field idField = Produto.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(produto, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        produto.setNome("Mouse Gamer");
        produto.setDescricao("Mouse gamer RGB");
        produto.setPreco(new BigDecimal("150.00"));
        produto.setQuantidadeEstoque(10);
        produto.setAvaliacao(new BigDecimal("4.5"));
        produto.setStatus(true);
    }

    @Test
    @DisplayName("Deve listar produtos com paginação")
    void deveListarProdutosComPaginacao() {
        // Arrange
        List<Produto> produtos = Arrays.asList(produto);
        Page<Produto> page = new PageImpl<>(produtos);
        when(produtoRepository.findAll(any(Pageable.class))).thenReturn(page);

        // Act
        ResponseEntity<Page<Produto>> response = produtoController.listar(null, 0, 10, null, null);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(produtoRepository, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @DisplayName("Deve buscar produtos por nome com paginação")
    void deveBuscarProdutosPorNomeComPaginacao() {
        // Arrange
        List<Produto> produtos = Arrays.asList(produto);
        Page<Produto> page = new PageImpl<>(produtos);
        when(produtoRepository.findByNomeContainingIgnoreCase(anyString(), any(Pageable.class))).thenReturn(page);

        // Act
        ResponseEntity<Page<Produto>> response = produtoController.listar("Mouse", 0, 10, null, null);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(produtoRepository, times(1)).findByNomeContainingIgnoreCase(anyString(), any(Pageable.class));
    }

    @Test
    @DisplayName("Deve listar todos os produtos sem paginação")
    void deveListarTodosProdutosSemPaginacao() {
        // Arrange
        List<Produto> produtos = Arrays.asList(produto);
        when(produtoRepository.findAll()).thenReturn(produtos);

        // Act
        List<Produto> response = produtoController.todosProdutos();

        // Assert
        assertNotNull(response);
        assertFalse(response.isEmpty());
        verify(produtoRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve buscar produto por ID com sucesso")
    void deveBuscarProdutoPorIdComSucesso() {
        // Arrange
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        // Act
        ResponseEntity<Produto> response = produtoController.buscarPorId(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(produtoRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Deve retornar 404 quando produto não encontrado")
    void deveRetornar404QuandoProdutoNaoEncontrado() {
        // Arrange
        when(produtoRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Produto> response = produtoController.buscarPorId(999L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve criar produto com sucesso")
    void deveCriarProdutoComSucesso() {
        // Arrange
        when(produtoRepository.save(any(Produto.class))).thenReturn(produto);

        // Act
        ResponseEntity<Produto> response = produtoController.criar(produto);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(produtoRepository, times(1)).save(any(Produto.class));
    }

    @Test
    @DisplayName("Deve retornar erro ao criar produto sem nome")
    void deveRetornarErroAoCriarProdutoSemNome() {
        // Arrange
        produto.setNome(null);

        // Act
        ResponseEntity<Produto> response = produtoController.criar(produto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(produtoRepository, never()).save(any(Produto.class));
    }

    @Test
    @DisplayName("Deve retornar erro ao criar produto sem preço")
    void deveRetornarErroAoCriarProdutoSemPreco() {
        // Arrange
        produto.setPreco(null);

        // Act
        ResponseEntity<Produto> response = produtoController.criar(produto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(produtoRepository, never()).save(any(Produto.class));
    }

    @Test
    @DisplayName("Deve filtrar produtos por status")
    void deveFiltrarProdutosPorStatus() {
        // Arrange
        List<Produto> produtos = Arrays.asList(produto);
        Page<Produto> page = new PageImpl<>(produtos);
        when(produtoRepository.findByStatus(eq(true), any(Pageable.class))).thenReturn(page);

        // Act
        ResponseEntity<Page<Produto>> response = produtoController.listar(null, 0, 10, true, null);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(produtoRepository, times(1)).findByStatus(eq(true), any(Pageable.class));
    }

    @Test
    @DisplayName("Deve validar produto com avaliação inválida")
    void deveValidarProdutoComAvaliacaoInvalida() {
        // Arrange
        produto.setAvaliacao(new BigDecimal("6.0")); // Acima de 5

        // Act
        ResponseEntity<Produto> response = produtoController.criar(produto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(produtoRepository, never()).save(any(Produto.class));
    }

    @Test
    @DisplayName("Deve validar produto com descrição muito longa")
    void deveValidarProdutoComDescricaoMuitoLonga() {
        // Arrange
        produto.setDescricao("a".repeat(2001)); // Mais de 2000 caracteres

        // Act
        ResponseEntity<Produto> response = produtoController.criar(produto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(produtoRepository, never()).save(any(Produto.class));
    }
}
