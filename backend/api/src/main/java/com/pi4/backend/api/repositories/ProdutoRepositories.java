package com.pi4.backend.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pi4.backend.api.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
}

