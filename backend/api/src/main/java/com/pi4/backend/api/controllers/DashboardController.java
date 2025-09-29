package com.pi4.backend.api.controllers;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.repositories.ProdutoRepository;
import com.pi4.backend.api.repositories.UserRepository;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/estatisticas")
    public ResponseEntity<Map<String, Object>> getEstatisticas() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Buscar todos os produtos para cálculos
            List<Produto> produtos = produtoRepository.findAll();
            
            // Contadores básicos
            long totalProdutos = produtos.size();
            long produtosAtivos = produtos.stream().filter(p -> Boolean.TRUE.equals(p.getStatus())).count();
            long produtosInativos = totalProdutos - produtosAtivos;
            long baixoEstoque = produtos.stream().filter(p -> p.getQuantidadeEstoque() != null && p.getQuantidadeEstoque() <= 5).count();
            
            // Valor total do estoque
            BigDecimal valorTotalEstoque = produtos.stream()
                .filter(p -> p.getPreco() != null && p.getQuantidadeEstoque() != null)
                .map(p -> p.getPreco().multiply(new BigDecimal(p.getQuantidadeEstoque())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Total de usuários
            long totalUsuarios = userRepository.count();
            
            // Montar resposta
            stats.put("totalProdutos", totalProdutos);
            stats.put("produtosAtivos", produtosAtivos);
            stats.put("produtosInativos", produtosInativos);
            stats.put("baixoEstoque", baixoEstoque);
            stats.put("valorTotalEstoque", valorTotalEstoque);
            stats.put("totalUsuarios", totalUsuarios);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            // Em caso de erro, retorna estatísticas zeradas
            stats.put("totalProdutos", 0);
            stats.put("produtosAtivos", 0);
            stats.put("produtosInativos", 0);
            stats.put("baixoEstoque", 0);
            stats.put("valorTotalEstoque", BigDecimal.ZERO);
            stats.put("totalUsuarios", 0);
            stats.put("error", "Erro ao calcular estatísticas");
            
            return ResponseEntity.ok(stats);
        }
    }

    @GetMapping("/produtos-criticos")
    public ResponseEntity<List<Produto>> getProdutosCriticos() {
        try {
            // Produtos com estoque crítico (≤ 5 unidades)
            List<Produto> produtosCriticos = produtoRepository.findByQuantidadeEstoqueLessThanEqualOrderByQuantidadeEstoqueAsc(5);
            return ResponseEntity.ok(produtosCriticos);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/produtos-caros")
    public ResponseEntity<List<Produto>> getProdutosMaisCaros() {
        try {
            // Top 5 produtos mais caros
            List<Produto> produtosCaros = produtoRepository.findTop5ByOrderByPrecoDesc();
            return ResponseEntity.ok(produtosCaros);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
}
