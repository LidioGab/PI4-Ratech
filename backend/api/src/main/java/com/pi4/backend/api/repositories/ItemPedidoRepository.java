package com.pi4.backend.api.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pi4.backend.api.entities.ItemPedido;

public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Long> {
    
    // Buscar itens por pedido
    List<ItemPedido> findByPedidoId(Long pedidoId);
    
    // Relatórios - produtos mais vendidos
    @Query("SELECT ip.produto.id, ip.nomeProduto, SUM(ip.quantidade) as totalVendido " +
           "FROM ItemPedido ip " +
           "WHERE ip.pedido.status != 'CANCELADO' " +
           "GROUP BY ip.produto.id, ip.nomeProduto " +
           "ORDER BY totalVendido DESC")
    List<Object[]> getProdutosMaisVendidos();
    
    // Relatórios - produtos mais vendidos por período
    @Query("SELECT ip.produto.id, ip.nomeProduto, SUM(ip.quantidade) as totalVendido " +
           "FROM ItemPedido ip " +
           "WHERE ip.pedido.status != 'CANCELADO' " +
           "AND ip.pedido.dataPedido BETWEEN :dataInicio AND :dataFim " +
           "GROUP BY ip.produto.id, ip.nomeProduto " +
           "ORDER BY totalVendido DESC")
    List<Object[]> getProdutosMaisVendidosPorPeriodo(@Param("dataInicio") java.time.LocalDateTime dataInicio,
                                                    @Param("dataFim") java.time.LocalDateTime dataFim);
}
