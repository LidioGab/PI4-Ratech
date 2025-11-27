package com.pi4.backend.api.entities;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_produto")
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_produto")
    private Integer id;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal preco;

    @Column(name = "qtd_estoque", nullable = false)
    private Integer quantidadeEstoque = 0;

    @Column(precision = 2, scale = 1)
    private BigDecimal avaliacao; 

    @Column(columnDefinition = "text")
    private String descricao;

    @Column(nullable = false)
    private Boolean status = true;

    @Column(name = "data_criacao", updatable = false, insertable = false)
    private Instant dataCriacao; 

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProdutoImagem> imagens = new ArrayList<>();

    public Produto() {}

    public Integer getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }
    public Integer getQuantidadeEstoque() { return quantidadeEstoque; }
    public void setQuantidadeEstoque(Integer quantidadeEstoque) { this.quantidadeEstoque = quantidadeEstoque; }
    public BigDecimal getAvaliacao() { return avaliacao; }
    public void setAvaliacao(BigDecimal avaliacao) { this.avaliacao = avaliacao; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Boolean getStatus() { return status; }
    public void setStatus(Boolean status) { this.status = status; }
    public Instant getDataCriacao() { return dataCriacao; }
    public List<ProdutoImagem> getImagens() { return imagens; }
    public void setImagens(List<ProdutoImagem> imagens) { this.imagens = imagens; }
}
