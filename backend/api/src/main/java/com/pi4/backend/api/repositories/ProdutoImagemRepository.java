package com.pi4.backend.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pi4.backend.api.entities.ProdutoImagem;

@Repository
public interface ProdutoImagemRepository extends JpaRepository<ProdutoImagem, Long> {
}
