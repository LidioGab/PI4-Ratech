package com.pi4.backend.api.controllers;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.repositories.ProdutoRepository;
import com.pi4.backend.api.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do DashboardController")
class DashboardControllerTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DashboardController dashboardController;

    private Produto produto1;
    private Produto produto2;

    @BeforeEach
    void setUp() {
        produto1 = new Produto();
        produto1.setNome("Mouse Gamer");
        produto1.setPreco(new BigDecimal("150.00"));
        produto1.setQuantidadeEstoque(10);
        produto1.setStatus(true);

        produto2 = new Produto();
        produto2.setNome("Teclado Mecânico");
        produto2.setPreco(new BigDecimal("300.00"));
        produto2.setQuantidadeEstoque(3);
        produto2.setStatus(true);
    }

    @Test
    @DisplayName("Deve obter estatísticas do dashboard")
    void deveObterEstatisticasDashboard() {
        // Arrange
        List<Produto> produtos = Arrays.asList(produto1, produto2);
        when(produtoRepository.findAll()).thenReturn(produtos);
        when(userRepository.count()).thenReturn(10L);

        // Act
        ResponseEntity<Map<String, Object>> response = dashboardController.getEstatisticas();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(produtoRepository, times(1)).findAll();
        verify(userRepository, times(1)).count();
    }

    @Test
    @DisplayName("Deve calcular total de produtos corretamente")
    void deveCalcularTotalDeProdutosCorretamente() {
        // Arrange
        List<Produto> produtos = Arrays.asList(produto1, produto2);
        when(produtoRepository.findAll()).thenReturn(produtos);
        when(userRepository.count()).thenReturn(5L);

        // Act
        ResponseEntity<Map<String, Object>> response = dashboardController.getEstatisticas();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> stats = response.getBody();
        assertNotNull(stats);
        assertEquals(2L, stats.get("totalProdutos"));
    }

    @Test
    @DisplayName("Deve calcular produtos ativos corretamente")
    void deveCalcularProdutosAtivosCorretamente() {
        // Arrange
        List<Produto> produtos = Arrays.asList(produto1, produto2);
        when(produtoRepository.findAll()).thenReturn(produtos);
        when(userRepository.count()).thenReturn(5L);

        // Act
        ResponseEntity<Map<String, Object>> response = dashboardController.getEstatisticas();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> stats = response.getBody();
        assertNotNull(stats);
        assertEquals(2L, stats.get("produtosAtivos"));
    }

    @Test
    @DisplayName("Deve calcular produtos com baixo estoque corretamente")
    void deveCalcularProdutosComBaixoEstoqueCorretamente() {
        // Arrange
        List<Produto> produtos = Arrays.asList(produto1, produto2);
        when(produtoRepository.findAll()).thenReturn(produtos);
        when(userRepository.count()).thenReturn(5L);

        // Act
        ResponseEntity<Map<String, Object>> response = dashboardController.getEstatisticas();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> stats = response.getBody();
        assertNotNull(stats);
        // produto2 tem 3 unidades, <= 5
        assertEquals(1L, stats.get("baixoEstoque"));
    }

    @Test
    @DisplayName("Deve calcular valor total do estoque corretamente")
    void deveCalcularValorTotalDoEstoqueCorretamente() {
        // Arrange
        List<Produto> produtos = Arrays.asList(produto1, produto2);
        when(produtoRepository.findAll()).thenReturn(produtos);
        when(userRepository.count()).thenReturn(5L);

        // Act
        ResponseEntity<Map<String, Object>> response = dashboardController.getEstatisticas();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> stats = response.getBody();
        assertNotNull(stats);
        
        // produto1: 150 * 10 = 1500
        // produto2: 300 * 3 = 900
        // Total: 2400
        BigDecimal valorEsperado = new BigDecimal("2400.00");
        BigDecimal valorCalculado = (BigDecimal) stats.get("valorTotalEstoque");
        assertEquals(0, valorEsperado.compareTo(valorCalculado));
    }

    @Test
    @DisplayName("Deve contar total de usuários corretamente")
    void deveContarTotalDeUsuariosCorretamente() {
        // Arrange
        List<Produto> produtos = Arrays.asList(produto1, produto2);
        when(produtoRepository.findAll()).thenReturn(produtos);
        when(userRepository.count()).thenReturn(15L);

        // Act
        ResponseEntity<Map<String, Object>> response = dashboardController.getEstatisticas();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> stats = response.getBody();
        assertNotNull(stats);
        assertEquals(15L, stats.get("totalUsuarios"));
    }

    @Test
    @DisplayName("Deve lidar com produtos inativos corretamente")
    void deveLidarComProdutosInativosCorretamente() {
        // Arrange
        produto2.setStatus(false);
        List<Produto> produtos = Arrays.asList(produto1, produto2);
        when(produtoRepository.findAll()).thenReturn(produtos);
        when(userRepository.count()).thenReturn(5L);

        // Act
        ResponseEntity<Map<String, Object>> response = dashboardController.getEstatisticas();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> stats = response.getBody();
        assertNotNull(stats);
        assertEquals(1L, stats.get("produtosAtivos"));
        assertEquals(1L, stats.get("produtosInativos"));
    }

    @Test
    @DisplayName("Deve retornar estatísticas mesmo com repositório vazio")
    void deveRetornarEstatisticasMesmoComRepositorioVazio() {
        // Arrange
        when(produtoRepository.findAll()).thenReturn(Arrays.asList());
        when(userRepository.count()).thenReturn(0L);

        // Act
        ResponseEntity<Map<String, Object>> response = dashboardController.getEstatisticas();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> stats = response.getBody();
        assertNotNull(stats);
        assertEquals(0L, stats.get("totalProdutos"));
        assertEquals(BigDecimal.ZERO, stats.get("valorTotalEstoque"));
    }

    @Test
    @DisplayName("Deve ignorar produtos com preço nulo no cálculo do valor total")
    void deveIgnorarProdutosComPrecoNuloNoCalculoDoValorTotal() {
        // Arrange
        produto2.setPreco(null);
        List<Produto> produtos = Arrays.asList(produto1, produto2);
        when(produtoRepository.findAll()).thenReturn(produtos);
        when(userRepository.count()).thenReturn(5L);

        // Act
        ResponseEntity<Map<String, Object>> response = dashboardController.getEstatisticas();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> stats = response.getBody();
        assertNotNull(stats);
        
        // Apenas produto1 deve ser calculado: 150 * 10 = 1500
        BigDecimal valorEsperado = new BigDecimal("1500.00");
        BigDecimal valorCalculado = (BigDecimal) stats.get("valorTotalEstoque");
        assertEquals(0, valorEsperado.compareTo(valorCalculado));
    }

    @Test
    @DisplayName("Deve ignorar produtos com quantidade nula no cálculo do valor total")
    void deveIgnorarProdutosComQuantidadeNulaNoCalculoDoValorTotal() {
        // Arrange
        produto2.setQuantidadeEstoque(null);
        List<Produto> produtos = Arrays.asList(produto1, produto2);
        when(produtoRepository.findAll()).thenReturn(produtos);
        when(userRepository.count()).thenReturn(5L);

        // Act
        ResponseEntity<Map<String, Object>> response = dashboardController.getEstatisticas();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> stats = response.getBody();
        assertNotNull(stats);
        
        // Apenas produto1 deve ser calculado: 150 * 10 = 1500
        BigDecimal valorEsperado = new BigDecimal("1500.00");
        BigDecimal valorCalculado = (BigDecimal) stats.get("valorTotalEstoque");
        assertEquals(0, valorEsperado.compareTo(valorCalculado));
    }
}
