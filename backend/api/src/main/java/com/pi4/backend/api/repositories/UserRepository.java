package com.pi4.backend.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.pi4.backend.api.entities.Usuario;

@Repository
public interface UserRepository extends JpaRepository<Usuario, Integer> {
  
}
