package com.pi4.backend.api.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pi4.backend.api.entities.Endereco;

@Repository
public interface EnderecoRepository extends JpaRepository<Endereco, Long> {
    
    @Query("SELECT e FROM Endereco e WHERE e.cliente.id = :clienteId ORDER BY e.principal DESC, e.id ASC")
    List<Endereco> findByClienteIdOrderByPrincipalDesc(@Param("clienteId") Integer clienteId);
    
    List<Endereco> findByClienteId(Integer clienteId);
    
    @Query("SELECT e FROM Endereco e WHERE e.cliente.id = :clienteId AND e.principal = true")
    Endereco findPrincipalByClienteId(@Param("clienteId") Integer clienteId);
}
