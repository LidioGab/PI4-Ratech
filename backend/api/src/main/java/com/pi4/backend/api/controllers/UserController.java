package com.pi4.backend.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.pi4.backend.api.entities.Usuario;
import com.pi4.backend.api.repositories.UserRepository;

@RestController
public class UserController {
  @Autowired
  private UserRepository userRepository;

  @PostMapping("/createuser")
  public String createUser(@RequestBody UsuarioDto usuarioDto) {
    Usuario usuario = new Usuario();
    usuario.setNmUser(usuarioDto.getNmUser());
    usuario.setDsEmail(usuarioDto.getDsEmail());
    usuario.setDsCpf(usuarioDto.getDsCpf());
    usuario.setDsTelefone(usuarioDto.getDsTelefone());
    usuario.setDsSenha(usuarioDto.getDsSenha());
    userRepository.save(usuario);
    return "Usuário criado: " + usuario.getNmUser();
  }

  @GetMapping("/getUsers")
  public List<Usuario> getUsers(){
    return userRepository.findAll();
  }

  @GetMapping("/getUser/{id}")
  public Object getUser(@PathVariable int id){
    return userRepository.findById(id).orElse(null);
  }

  public static class UsuarioDto {
    private String nmUser;
    private String dsEmail;
    private String dsCpf;
    private String dsTelefone;
    private String dsSenha;

    public String getNmUser() { return nmUser; }
    public void setNmUser(String nmUser) { this.nmUser = nmUser; }
    public String getDsEmail() { return dsEmail; }
    public void setDsEmail(String dsEmail) { this.dsEmail = dsEmail; }
    public String getDsCpf() { return dsCpf; }
    public void setDsCpf(String dsCpf) { this.dsCpf = dsCpf; }
    public String getDsTelefone() { return dsTelefone; }
    public void setDsTelefone(String dsTelefone) { this.dsTelefone = dsTelefone; }
    public String getDsSenha() {return dsSenha;}
    public void setDsSenha(String dsSenha) {this.dsSenha = dsSenha;}

  }
}
