package com.pi4.backend.api.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pi4.backend.api.entities.EnderecoCliente;

@Repository
public interface EnderecoClienteRepository extends JpaRepository<EnderecoCliente, Integer> {
    List<EnderecoCliente> findByClienteIdAndAtivo(Integer clienteId, Boolean ativo);
}
