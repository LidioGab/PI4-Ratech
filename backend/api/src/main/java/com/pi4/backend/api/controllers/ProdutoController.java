package com.pi4.backend.api.controllers;

import com.pi4.backend.api.model.Produto;
import com.pi4.backend.api.repositories.ProdutoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoRepository repository;

    public ProdutoController(ProdutoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Produto> listarTodos() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Produto buscarPorId(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @PostMapping
    public Produto criar(@RequestBody Produto produto) {
        return repository.save(produto);
    }

    @PutMapping("/{id}")
    public Produto atualizar(@PathVariable Long id, @RequestBody Produto produtoAtualizado) {
        return repository.findById(id).map(p -> {
            p.setNome(produtoAtualizado.getNome());
            p.setPreco(produtoAtualizado.getPreco());
            p.setQuantidade(produtoAtualizado.getQuantidade());
            return repository.save(p);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}