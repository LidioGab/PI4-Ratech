package com.pi4.backend.api.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pi4.backend.api.entities.Produto;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
	Page<Produto> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}
