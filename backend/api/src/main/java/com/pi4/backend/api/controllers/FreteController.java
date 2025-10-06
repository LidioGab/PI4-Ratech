package com.pi4.backend.api.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.pi4.backend.api.services.FreteService;

import java.util.Map;

@RestController
@RequestMapping("/api/frete")
@CrossOrigin(origins = "*")
public class FreteController {

    @Autowired
    private FreteService freteService;

    @GetMapping("/{cep}")
    public Map<String, Double> calcularFrete(@PathVariable String cep) {
        return freteService.calcularFretePorCep(cep);
    }
}
