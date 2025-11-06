package com.pi4.backend.api.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pi4.backend.api.entities.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    // Buscar pedidos por cliente
    List<Pedido> findByClienteIdOrderByDataPedidoDesc(Integer clienteId);
    
    // Buscar pedidos por cliente com paginação
    Page<Pedido> findByClienteIdOrderByDataPedidoDesc(Integer clienteId, Pageable pageable);
    
    // Buscar por número do pedido
    Optional<Pedido> findByNumeroPedido(String numeroPedido);
    
    // Buscar pedidos por status
    List<Pedido> findByStatusOrderByDataPedidoDesc(Pedido.StatusPedido status);
    
    // Buscar pedidos por status com paginação
    Page<Pedido> findByStatusOrderByDataPedidoDesc(Pedido.StatusPedido status, Pageable pageable);
    
    // Contar pedidos por cliente
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.cliente.id = :clienteId")
    Long countByClienteId(@Param("clienteId") Integer clienteId);
    
    // Buscar últimos pedidos de um cliente
    @Query("SELECT p FROM Pedido p WHERE p.cliente.id = :clienteId ORDER BY p.dataPedido DESC")
    List<Pedido> findTop10ByClienteIdOrderByDataPedidoDesc(@Param("clienteId") Integer clienteId, Pageable pageable);
    
    // Relatórios - total de vendas por período
    @Query("SELECT SUM(p.valorTotal) FROM Pedido p WHERE p.dataPedido BETWEEN :dataInicio AND :dataFim AND p.status != 'CANCELADO'")
    Double getTotalVendasPorPeriodo(@Param("dataInicio") java.time.LocalDateTime dataInicio, 
                                   @Param("dataFim") java.time.LocalDateTime dataFim);
    
    // Relatórios - contar pedidos por período
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.dataPedido BETWEEN :dataInicio AND :dataFim")
    Long countPedidosPorPeriodo(@Param("dataInicio") java.time.LocalDateTime dataInicio, 
                               @Param("dataFim") java.time.LocalDateTime dataFim);
}
