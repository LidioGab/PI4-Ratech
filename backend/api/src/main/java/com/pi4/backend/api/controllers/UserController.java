package com.pi4.backend.api.controllers;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.Grupo;
import com.pi4.backend.api.entities.Usuario;
import com.pi4.backend.api.repositories.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@RestController
@RequestMapping("/usuarios")
public class UserController {

  @Autowired
  private UserRepository userRepository;

  @PersistenceContext
  private EntityManager em;

  @Autowired
  private PasswordEncoder passwordEncoder;

  private static final Pattern REAL_CPF_PATTERN = Pattern.compile("^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2})$");

  private boolean isValidCpf(String cpf) {
    if (cpf == null) return false;
    return REAL_CPF_PATTERN.matcher(cpf).matches();
  }

  private Grupo findGrupoByNome(String nome) {
    List<Grupo> result = em.createQuery("select g from Grupo g where lower(g.nome) = lower(:n)", Grupo.class)
        .setParameter("n", nome).getResultList();
    return result.isEmpty() ? null : result.get(0);
  }

  // LISTAR
  @GetMapping
  public List<Usuario> listar() { return userRepository.findAll(); }

  // DETALHAR
  @GetMapping("/{id}")
  public ResponseEntity<?> obter(@PathVariable Integer id) {
    return userRepository.findById(id)
        .<ResponseEntity<?>>map(ResponseEntity::ok)
        .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado"));
  }

  // CADASTRAR
  @PostMapping
  public ResponseEntity<?> criar(@RequestBody CriarUsuarioDto dto) {
    // Validar obrigatórios
    if (dto.getNome() == null || dto.getEmail() == null || dto.getCpf() == null || dto.getSenha() == null || dto.getConfirmacaoSenha() == null || dto.getGrupo() == null) {
      return ResponseEntity.badRequest().body("Campos obrigatórios ausentes");
    }
    if (!dto.getSenha().equals(dto.getConfirmacaoSenha())) {
      return ResponseEntity.badRequest().body("Senhas não conferem");
    }
    if (!isValidCpf(dto.getCpf())) {
      return ResponseEntity.badRequest().body("CPF inválido (formato esperado 000.000.000-00)");
    }
    if (userRepository.existsByEmail(dto.getEmail())) {
      return ResponseEntity.badRequest().body("Email já cadastrado");
    }
    if (userRepository.existsByCpf(dto.getCpf())) {
      return ResponseEntity.badRequest().body("CPF já cadastrado");
    }
    if (!("Administrador".equalsIgnoreCase(dto.getGrupo()) || "Estoquista".equalsIgnoreCase(dto.getGrupo()))) {
      return ResponseEntity.badRequest().body("Grupo inválido");
    }
    Grupo grupo = findGrupoByNome(dto.getGrupo());
    if (grupo == null) {
      return ResponseEntity.badRequest().body("Grupo não encontrado na base");
    }
    Usuario usuario = new Usuario();
    usuario.setNome(dto.getNome());
    usuario.setEmail(dto.getEmail());
    usuario.setCpf(dto.getCpf());
    usuario.setGrupo(grupo);
    usuario.setStatus(true); // status inicial ativo
  // dto.senha contém a senha em texto (compatibilidade). dto.senhaHash pode conter SHA-256 client-side.
  // Mantemos bcrypt(server-side) sobre a senha original.
  usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
    userRepository.save(usuario);
    return ResponseEntity.status(HttpStatus.CREATED).body(usuario.getId());
  }

  // ALTERAR DADOS (sem email e senha)
  @PutMapping("/{id}")
  public ResponseEntity<?> atualizar(@PathVariable Integer id, @RequestBody AtualizarUsuarioDto dto) {
    Optional<Usuario> opt = userRepository.findById(id);
    if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
    Usuario usuario = opt.get();
    if (dto.getNome() != null) usuario.setNome(dto.getNome());
    if (dto.getCpf() != null) {
      if (!isValidCpf(dto.getCpf())) return ResponseEntity.badRequest().body("CPF inválido");
      if (!dto.getCpf().equals(usuario.getCpf()) && userRepository.existsByCpf(dto.getCpf())) {
        return ResponseEntity.badRequest().body("CPF já cadastrado");
      }
      usuario.setCpf(dto.getCpf());
    }
    if (dto.getGrupo() != null) {
      if (!("Administrador".equalsIgnoreCase(dto.getGrupo()) || "Estoquista".equalsIgnoreCase(dto.getGrupo()))) {
        return ResponseEntity.badRequest().body("Grupo inválido");
      }
      Grupo g = findGrupoByNome(dto.getGrupo());
      if (g == null) return ResponseEntity.badRequest().body("Grupo não encontrado");
      usuario.setGrupo(g);
    }
    userRepository.save(usuario);
    return ResponseEntity.ok("Atualizado");
  }

  // ALTERAR SENHA
  @PutMapping("/{id}/senha")
  public ResponseEntity<?> alterarSenha(@PathVariable Integer id, @RequestBody AlterarSenhaDto dto) {
    Optional<Usuario> opt = userRepository.findById(id);
    if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
    if (dto.getNovaSenha() == null || dto.getConfirmacao() == null) {
      return ResponseEntity.badRequest().body("Senha e confirmação são obrigatórias");
    }
    if (!dto.getNovaSenha().equals(dto.getConfirmacao())) {
      return ResponseEntity.badRequest().body("Senhas não conferem");
    }
    Usuario usuario = opt.get();
  usuario.setSenha(passwordEncoder.encode(dto.getNovaSenha()));
    userRepository.save(usuario);
    return ResponseEntity.ok("Senha alterada");
  }

  // ATIVAR / DESATIVAR
  @PutMapping("/{id}/status")
  public ResponseEntity<?> alterarStatus(@PathVariable Integer id) {
    Optional<Usuario> opt = userRepository.findById(id);
    if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
    Usuario usuario = opt.get();
    usuario.setStatus(!Boolean.TRUE.equals(usuario.getStatus()));
    userRepository.save(usuario);
    return ResponseEntity.ok(usuario.getStatus() ? "Usuário ativado" : "Usuário desativado");
  }

  // DTOs
  public static class CriarUsuarioDto {
    private String nome;
    private String cpf;
    private String email;
    private String senha;
    private String confirmacaoSenha;
    private String grupo;
    private String senhaHash; // opcional: SHA-256 client-side
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getConfirmacaoSenha() { return confirmacaoSenha; }
    public void setConfirmacaoSenha(String confirmacaoSenha) { this.confirmacaoSenha = confirmacaoSenha; }
    public String getGrupo() { return grupo; }
    public void setGrupo(String grupo) { this.grupo = grupo; }
    public String getSenhaHash() { return senhaHash; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
  }

  public static class AtualizarUsuarioDto {
    private String nome;
    private String cpf;
    private String grupo;
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getGrupo() { return grupo; }
    public void setGrupo(String grupo) { this.grupo = grupo; }
  }

  public static class AlterarSenhaDto {
    private String novaSenha;
    private String confirmacao;
    private String senhaHash; // opcional
    public String getNovaSenha() { return novaSenha; }
    public void setNovaSenha(String novaSenha) { this.novaSenha = novaSenha; }
    public String getConfirmacao() { return confirmacao; }
    public void setConfirmacao(String confirmacao) { this.confirmacao = confirmacao; }
    public String getSenhaHash() { return senhaHash; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
  }
}
