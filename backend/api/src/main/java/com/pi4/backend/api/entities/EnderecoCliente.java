package com.pi4.backend.api.entities;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_endereco_cliente")
public class EnderecoCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_endereco")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    @JsonBackReference
    private Cliente cliente;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoEndereco tipo;

    @Column(name = "cep", nullable = false, length = 9)
    private String cep;

    @Column(name = "logradouro", nullable = false, length = 255)
    private String logradouro;

    @Column(name = "numero", nullable = false, length = 20)
    private String numero;

    @Column(name = "complemento", length = 100)
    private String complemento;

    @Column(name = "bairro", nullable = false, length = 100)
    private String bairro;

    @Column(name = "cidade", nullable = false, length = 100)
    private String cidade;

    @Column(name = "uf", nullable = false, length = 2)
    private String uf;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    public enum TipoEndereco {
        FATURAMENTO, ENTREGA
    }

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public TipoEndereco getTipo() { return tipo; }
    public void setTipo(TipoEndereco tipo) { this.tipo = tipo; }

    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }

    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getComplemento() { return complemento; }
    public void setComplemento(String complemento) { this.complemento = complemento; }

    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
}
