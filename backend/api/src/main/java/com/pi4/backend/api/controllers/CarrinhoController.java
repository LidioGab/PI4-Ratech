package com.pi4.backend.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.CarrinhoItem;
import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.repositories.CarrinhoRepository;
import com.pi4.backend.api.repositories.ClienteRepository;
import com.pi4.backend.api.repositories.ProdutoRepository;

@RestController
@RequestMapping("/api/carrinho")
@CrossOrigin(origins = "*")
public class CarrinhoController {
    
    @Autowired
    private CarrinhoRepository carrinhoRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private ProdutoRepository produtoRepository;
    
    // DTO para requests
    public static class AdicionarItemRequest {
        private Integer clienteId;
        private Long produtoId;
        private Integer quantidade;
        
        // Getters e Setters
        public Integer getClienteId() { return clienteId; }
        public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
        public Long getProdutoId() { return produtoId; }
        public void setProdutoId(Long produtoId) { this.produtoId = produtoId; }
        public Integer getQuantidade() { return quantidade; }
        public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    }
    
    public static class AtualizarQuantidadeRequest {
        private Integer quantidade;
        
        public Integer getQuantidade() { return quantidade; }
        public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    }
    
    // Obter carrinho do cliente
    @GetMapping("/{clienteId}")
    public ResponseEntity<?> obterCarrinho(@PathVariable Integer clienteId) {
        try {
            if (!clienteRepository.existsById(clienteId)) {
                return ResponseEntity.status(404).body("Cliente não encontrado");
            }
            
            List<CarrinhoItem> itens = carrinhoRepository.findByClienteId(clienteId);
            return ResponseEntity.ok(itens);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    // Adicionar item ao carrinho
    @PostMapping("/adicionar")
    public ResponseEntity<?> adicionarItem(@RequestBody AdicionarItemRequest request) {
        try {
            if (request.getClienteId() == null) {
                return ResponseEntity.status(400).body("Cliente ID é obrigatório");
            }
            
            if (request.getProdutoId() == null) {
                return ResponseEntity.status(400).body("Produto ID é obrigatório");
            }
            
            if (request.getQuantidade() == null || request.getQuantidade() <= 0) {
                return ResponseEntity.status(400).body("Quantidade deve ser maior que zero");
            }
            
            Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElse(null);
            if (cliente == null) {
                return ResponseEntity.status(404).body("Cliente não encontrado");
            }
            
            Produto produto = produtoRepository.findById(request.getProdutoId())
                .orElse(null);
            if (produto == null) {
                return ResponseEntity.status(404).body("Produto não encontrado");
            }
            
            if (!produto.getStatus()) {
                return ResponseEntity.status(400).body("Produto inativo");
            }
            
            // Verificar estoque
            if (produto.getQuantidadeEstoque() < request.getQuantidade()) {
                return ResponseEntity.status(400).body("Estoque insuficiente");
            }
            
            // Verificar se item já existe no carrinho
            CarrinhoItem itemExistente = carrinhoRepository
                .findByClienteIdAndProdutoId(request.getClienteId(), request.getProdutoId());
            
            if (itemExistente != null) {
                // Atualizar quantidade
                int novaQuantidade = itemExistente.getQuantidade() + request.getQuantidade();
                
                if (produto.getQuantidadeEstoque() < novaQuantidade) {
                    return ResponseEntity.status(400).body("Estoque insuficiente");
                }
                
                itemExistente.setQuantidade(novaQuantidade);
                CarrinhoItem itemAtualizado = carrinhoRepository.save(itemExistente);
                return ResponseEntity.ok(itemAtualizado);
            } else {
                // Criar novo item
                CarrinhoItem novoItem = new CarrinhoItem(cliente, produto, request.getQuantidade());
                CarrinhoItem itemSalvo = carrinhoRepository.save(novoItem);
                return ResponseEntity.status(201).body(itemSalvo);
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    // Atualizar quantidade de um item
    @PutMapping("/{clienteId}/item/{produtoId}")
    public ResponseEntity<?> atualizarQuantidade(
            @PathVariable Integer clienteId,
            @PathVariable Long produtoId,
            @RequestBody AtualizarQuantidadeRequest request) {
        try {
            if (request.getQuantidade() == null || request.getQuantidade() <= 0) {
                return ResponseEntity.status(400).body("Quantidade deve ser maior que zero");
            }
            
            CarrinhoItem item = carrinhoRepository
                .findByClienteIdAndProdutoId(clienteId, produtoId);
            
            if (item == null) {
                return ResponseEntity.status(404).body("Item não encontrado no carrinho");
            }
            
            // Verificar estoque
            Produto produto = item.getProduto();
            if (produto.getQuantidadeEstoque() < request.getQuantidade()) {
                return ResponseEntity.status(400).body("Estoque insuficiente");
            }
            
            item.setQuantidade(request.getQuantidade());
            CarrinhoItem itemAtualizado = carrinhoRepository.save(item);
            return ResponseEntity.ok(itemAtualizado);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    // Remover item do carrinho
    @DeleteMapping("/{clienteId}/item/{produtoId}")
    public ResponseEntity<?> removerItem(@PathVariable Integer clienteId, @PathVariable Long produtoId) {
        try {
            CarrinhoItem item = carrinhoRepository
                .findByClienteIdAndProdutoId(clienteId, produtoId);
            
            if (item == null) {
                return ResponseEntity.status(404).body("Item não encontrado no carrinho");
            }
            
            carrinhoRepository.delete(item);
            return ResponseEntity.ok().body("Item removido do carrinho");
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    // Limpar carrinho
    @DeleteMapping("/{clienteId}")
    public ResponseEntity<?> limparCarrinho(@PathVariable Integer clienteId) {
        try {
            if (!clienteRepository.existsById(clienteId)) {
                return ResponseEntity.status(404).body("Cliente não encontrado");
            }
            
            carrinhoRepository.deleteByClienteId(clienteId);
            return ResponseEntity.ok().body("Carrinho limpo");
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    // Obter contagem de itens no carrinho
    @GetMapping("/{clienteId}/count")
    public ResponseEntity<?> contarItens(@PathVariable Integer clienteId) {
        try {
            if (!clienteRepository.existsById(clienteId)) {
                return ResponseEntity.status(404).body("Cliente não encontrado");
            }
            
            Integer totalItens = carrinhoRepository.getTotalItemsByClienteId(clienteId);
            return ResponseEntity.ok(totalItens != null ? totalItens : 0);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
}
