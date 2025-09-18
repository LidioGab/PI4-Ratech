package com.pi4.backend.api.controllers;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.repositories.ProdutoRepository;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoRepository repository;

    public ProdutoController(ProdutoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<Produto>> listarTodos() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<Produto> criar(@RequestBody Produto produto) {
        if (produto.getNome() == null || produto.getPreco() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (produto.getQuantidadeEstoque() == null) produto.setQuantidadeEstoque(0);
        if (produto.getStatus() == null) produto.setStatus(true);
        
        if (produto.getAvaliacao() != null) {
            BigDecimal av = produto.getAvaliacao();
            if (av.compareTo(new BigDecimal("1.0")) < 0 || av.compareTo(new BigDecimal("5.0")) > 0) {
                produto.setAvaliacao(null);
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(produto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(@PathVariable Long id, @RequestBody Produto produtoAtualizado) {
        return repository.findById(id).map(p -> {
            if (produtoAtualizado.getNome() != null) p.setNome(produtoAtualizado.getNome());
            if (produtoAtualizado.getPreco() != null) p.setPreco(produtoAtualizado.getPreco());
            if (produtoAtualizado.getQuantidadeEstoque() != null) p.setQuantidadeEstoque(produtoAtualizado.getQuantidadeEstoque());
            if (produtoAtualizado.getDescricao() != null) p.setDescricao(produtoAtualizado.getDescricao());
            if (produtoAtualizado.getAvaliacao() != null) p.setAvaliacao(produtoAtualizado.getAvaliacao());
            if (produtoAtualizado.getStatus() != null) p.setStatus(produtoAtualizado.getStatus());
            Produto salvo = repository.save(p);
            return ResponseEntity.ok(salvo);
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
