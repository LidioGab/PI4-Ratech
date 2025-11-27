package com.pi4.backend.api.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pi4.backend.api.entities.Produto;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
	Page<Produto> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
	Page<Produto> findByStatus(Boolean status, Pageable pageable);
	Page<Produto> findByNomeContainingIgnoreCaseAndStatus(String nome, Boolean status, Pageable pageable);
	
	// Métodos para dashboard
	List<Produto> findByQuantidadeEstoqueLessThanEqualOrderByQuantidadeEstoqueAsc(Integer quantidade);
	List<Produto> findTop5ByOrderByPrecoDesc();
}
