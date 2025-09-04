package com.pi4.backend.api.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.Usuario;
import com.pi4.backend.api.repositories.UserRepository;

@RestController
public class loginController {
  @Autowired
  private UserRepository userRepository;
  
  @PostMapping("/login")
  public ResponseEntity<String> login(@RequestBody LoginDto loginDto){
    Usuario usuario = userRepository.findByDsEmail(loginDto.getDsEmail());
    if (usuario != null && usuario.getDsSenha().equals(loginDto.getDsSenha())) {
      return ResponseEntity.ok("Login realizado com sucesso!");
    }
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas");
  }


  public static class LoginDto{
    private String dsEmail;
    private String dsSenha;

    public String getDsEmail() { return dsEmail; }
    public void setDsEmail(String dsEmail) { this.dsEmail = dsEmail; }
    public String getDsSenha() { return dsSenha; }
    public void setDsSenha(String dsSenha) { this.dsSenha = dsSenha; }
  }
}
