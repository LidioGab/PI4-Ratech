package com.pi4.backend.api.services;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class FreteService {

    public Map<String, Double> calcularFretePorCep(String cep) {
        Map<String, Double> opcoesFrete = new LinkedHashMap<>();

        // Exemplo de cálculo simples (pode adaptar depois)
        if (cep.startsWith("01")) { // SP
            opcoesFrete.put("Entrega Normal (5 dias)", 15.90);
            opcoesFrete.put("Entrega Rápida (2 dias)", 29.90);
            opcoesFrete.put("Frete Grátis", 0.0);
        } else if (cep.startsWith("20")) { // RJ
            opcoesFrete.put("Entrega Normal (7 dias)", 19.90);
            opcoesFrete.put("Entrega Expressa (3 dias)", 34.90);
            opcoesFrete.put("Frete Grátis", 0.0);
        } else {
            opcoesFrete.put("Entrega Normal (10 dias)", 24.90);
            opcoesFrete.put("Entrega Expressa (4 dias)", 39.90);
            opcoesFrete.put("Frete Grátis", 0.0);
        }

        return opcoesFrete;
    }
}
