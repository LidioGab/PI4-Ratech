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

import com.pi4.backend.api.entities.Endereco;
import com.pi4.backend.api.services.EnderecoService;

@RestController
@RequestMapping("/api/enderecos")
@CrossOrigin(origins = "http://localhost:5173")
public class EnderecoController {

    @Autowired
    private EnderecoService enderecoService;

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Endereco>> listarEnderecosPorCliente(@PathVariable Integer clienteId) {
        try {
            List<Endereco> enderecos = enderecoService.listarPorCliente(clienteId);
            return ResponseEntity.ok(enderecos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<Endereco> criarEndereco(@RequestBody Endereco endereco) {
        try {
            Endereco novoEndereco = enderecoService.criarEndereco(endereco);
            return ResponseEntity.ok(novoEndereco);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Endereco> atualizarEndereco(@PathVariable Long id, @RequestBody Endereco endereco) {
        try {
            endereco.setId(id);
            Endereco enderecoAtualizado = enderecoService.atualizarEndereco(endereco);
            return ResponseEntity.ok(enderecoAtualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarEndereco(@PathVariable Long id) {
        try {
            enderecoService.deletarEndereco(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
