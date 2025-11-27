package com.pi4.backend.api.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pi4.backend.api.entities.CarrinhoItem;

public interface CarrinhoRepository extends JpaRepository<CarrinhoItem, Long> {
    
    List<CarrinhoItem> findByClienteId(Integer clienteId);
    
    CarrinhoItem findByClienteIdAndProdutoId(Integer clienteId, Integer produtoId);
    
    void deleteByClienteId(Integer clienteId);
    
    void deleteByClienteIdAndProdutoId(Integer clienteId, Integer produtoId);
    
    @Query("SELECT COUNT(c) FROM CarrinhoItem c WHERE c.cliente.id = :clienteId")
    Long countByClienteId(@Param("clienteId") Integer clienteId);
    
    @Query("SELECT SUM(c.quantidade) FROM CarrinhoItem c WHERE c.cliente.id = :clienteId")
    Integer getTotalItemsByClienteId(@Param("clienteId") Integer clienteId);
}
