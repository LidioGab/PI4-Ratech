package com.pi4.backend.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class LogoutController {

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
       
        return ResponseEntity.ok("Logout realizado com sucesso!");
    }

}
    
