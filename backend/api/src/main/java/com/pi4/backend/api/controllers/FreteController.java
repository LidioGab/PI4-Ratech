package com.pi4.backend.api.controllers;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.services.FreteService;

@RestController
@RequestMapping("/api/frete")
@CrossOrigin(origins = "*")
public class FreteController {

    @Autowired
    private FreteService freteService;

    @GetMapping
    public ResponseEntity<?> calcularFrete(@RequestParam String cep) {
        try {
            if (cep == null || cep.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("CEP é obrigatório");
            }

            Map<String, Double> opcoes = freteService.calcularFretePorCep(cep.replaceAll("\\D", ""));

            // Construir resposta incluindo uma chave 'padrao' com uma estimativa simples
            Map<String, Object> resposta = new LinkedHashMap<>();
            resposta.put("opcoes", opcoes);

            // Determinar padrao: menor valor positivo não-zero, ou 0 se encontrar frete grátis
            Double padrao = null;
            if (opcoes != null) {
                for (Map.Entry<String, Double> e : opcoes.entrySet()) {
                    Double v = e.getValue();
                    if (v != null && v == 0.0) {
                        padrao = 0.0;
                        break;
                    }
                    if (v != null && v > 0) {
                        if (padrao == null || v < padrao) padrao = v;
                    }
                }
            }
            if (padrao == null) padrao = 0.0;

            resposta.put("padrao", padrao);
            resposta.put("cep", cep.replaceAll("\\D", ""));

            return ResponseEntity.ok(resposta);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao calcular frete");
        }
    }

    @GetMapping("/{cep}")
    public ResponseEntity<?> calcularFretePorPath(@PathVariable String cep) {
        try {
            if (cep == null || cep.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("CEP é obrigatório");
            }
            Map<String, Double> opcoes = freteService.calcularFretePorCep(cep.replaceAll("\\D", ""));
            return ResponseEntity.ok(opcoes);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao calcular frete");
        }
    }
}
