package com.pi4.backend.api.controllers;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.repositories.ProdutoRepository;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoRepository repository;

    public ProdutoController(ProdutoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<Page<Produto>> listar(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "status", required = false) Boolean status,
            @RequestParam(value = "sort", required = false) String sortParam) {

        // Construir Sort
        Sort sort = Sort.by(Sort.Direction.DESC, "id"); // default
        if (sortParam != null && !sortParam.isBlank()) {
            String[] parts = sortParam.split(",");
            if (parts.length == 2) {
                String field = parts[0];
                String direction = parts[1];
                Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
                sort = Sort.by(dir, field);
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Produto> result;
        if (query != null && !query.isBlank()) {
            if (status != null) {
                result = repository.findByNomeContainingIgnoreCaseAndStatus(query.trim(), status, pageable);
            } else {
                result = repository.findByNomeContainingIgnoreCase(query.trim(), pageable);
            }
        } else {
            if (status != null) {
                result = repository.findByStatus(status, pageable);
            } else {
                result = repository.findAll(pageable);
            }
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/todos")
    public List<Produto> todosProdutos() {
        return this.repository.findAll();
    }
    
    @GetMapping("/{id:[0-9]+}")
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
        if (produto.getDescricao() == null || produto.getDescricao().length() == 0 || produto.getDescricao().length() > 2000) {
            return ResponseEntity.badRequest().build();
        }
        
        if (produto.getAvaliacao() != null) {
            BigDecimal av = produto.getAvaliacao();
            boolean range = av.compareTo(new BigDecimal("1.0")) >= 0 && av.compareTo(new BigDecimal("5.0")) <= 0;
            boolean stepValido = av.multiply(new BigDecimal("10")).remainder(new BigDecimal("5")).intValue() == 0;
            if (!(range && stepValido)) return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(produto));
    }

    @PutMapping("/{id:[0-9]+}")
    public ResponseEntity<Produto> atualizar(@PathVariable Long id, @RequestBody Produto produtoAtualizado) {
        var opt = repository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Produto p = opt.get();
        if (produtoAtualizado.getDescricao() != null) {
            if (produtoAtualizado.getDescricao().length() == 0 || produtoAtualizado.getDescricao().length() > 2000) {
                return ResponseEntity.badRequest().build();
            }
            p.setDescricao(produtoAtualizado.getDescricao());
        }
        if (produtoAtualizado.getAvaliacao() != null) {
            BigDecimal av = produtoAtualizado.getAvaliacao();
            boolean range = av.compareTo(new BigDecimal("1.0")) >= 0 && av.compareTo(new BigDecimal("5.0")) <= 0;
            boolean stepValido = av.multiply(new BigDecimal("10")).remainder(new BigDecimal("5")).intValue() == 0;
            if (!(range && stepValido)) {
                return ResponseEntity.badRequest().build();
            }
            p.setAvaliacao(av);
        }
        if (produtoAtualizado.getNome() != null) p.setNome(produtoAtualizado.getNome());
        if (produtoAtualizado.getPreco() != null) p.setPreco(produtoAtualizado.getPreco());
        if (produtoAtualizado.getQuantidadeEstoque() != null) p.setQuantidadeEstoque(produtoAtualizado.getQuantidadeEstoque());
        if (produtoAtualizado.getStatus() != null) p.setStatus(produtoAtualizado.getStatus());
        Produto salvo = repository.save(p);
        return ResponseEntity.ok(salvo);
    }

    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id:[0-9]+}/status")
    public ResponseEntity<Produto> toggleStatus(@PathVariable Long id) {
        return repository.findById(id).map(p -> {
            p.setStatus(!Boolean.TRUE.equals(p.getStatus()));
            return ResponseEntity.ok(repository.save(p));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
