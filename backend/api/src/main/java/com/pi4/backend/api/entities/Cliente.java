package com.pi4.backend.api.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer id;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @Column(name = "cpf", nullable = false, length = 14, unique = true)
    private String cpf;

    @Column(name = "email", nullable = false, length = 150, unique = true)
    private String email;

    @Column(name = "senha", nullable = false, length = 255)
    private String senha;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "genero", nullable = false)
    private Genero genero;

    @Column(name = "status", nullable = false)
    private Boolean status = true;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<EnderecoCliente> enderecos;

    public enum Genero {
        MASCULINO, FEMININO, OUTRO, PREFIRO_NAO_INFORMAR
    }

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public Genero getGenero() { return genero; }
    public void setGenero(Genero genero) { this.genero = genero; }

    public Boolean getStatus() { return status; }
    public void setStatus(Boolean status) { this.status = status; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public List<EnderecoCliente> getEnderecos() { return enderecos; }
    public void setEnderecos(List<EnderecoCliente> enderecos) { this.enderecos = enderecos; }
}
