package com.pi4.backend.api.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_pedido")
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;
    
    @Column(name = "numero_pedido", unique = true, nullable = false)
    private String numeroPedido;
    
    @Column(name = "data_pedido", nullable = false)
    private LocalDateTime dataPedido;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusPedido status;
    
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(name = "valor_frete", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorFrete;
    
    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;
    
    // Endereço de entrega
    @Column(name = "endereco_entrega_cep", nullable = false)
    private String enderecoEntregaCep;
    
    @Column(name = "endereco_entrega_logradouro", nullable = false)
    private String enderecoEntregaLogradouro;
    
    @Column(name = "endereco_entrega_numero", nullable = false)
    private String enderecoEntregaNumero;
    
    @Column(name = "endereco_entrega_complemento")
    private String enderecoEntregaComplemento;
    
    @Column(name = "endereco_entrega_bairro", nullable = false)
    private String enderecoEntregaBairro;
    
    @Column(name = "endereco_entrega_cidade", nullable = false)
    private String enderecoEntregaCidade;
    
    @Column(name = "endereco_entrega_uf", nullable = false, length = 2)
    private String enderecoEntregaUf;
    
    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ItemPedido> itens = new ArrayList<>();
    
    // Enum para status do pedido
    public enum StatusPedido {
        AGUARDANDO_PAGAMENTO("aguardando pagamento"),
        PAGAMENTO_REJEITADO("pagamento rejeitado"),
        PAGAMENTO_COM_SUCESSO("pagamento com sucesso"),
        AGUARDANDO_RETIRADA("aguardando retirada"),
        EM_TRANSITO("em transito"),
        ENTREGUE("entregue"),
        CANCELADO("cancelado");
        
        private String descricao;
        
        StatusPedido(String descricao) {
            this.descricao = descricao;
        }
        
        public String getDescricao() {
            return descricao;
        }
    }
    
    // Construtores
    public Pedido() {
        this.dataPedido = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
        this.status = StatusPedido.AGUARDANDO_PAGAMENTO;
    }
    
    public Pedido(Cliente cliente, String numeroPedido) {
        this();
        this.cliente = cliente;
        this.numeroPedido = numeroPedido;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Cliente getCliente() {
        return cliente;
    }
    
    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }
    
    public String getNumeroPedido() {
        return numeroPedido;
    }
    
    public void setNumeroPedido(String numeroPedido) {
        this.numeroPedido = numeroPedido;
    }
    
    public LocalDateTime getDataPedido() {
        return dataPedido;
    }
    
    public void setDataPedido(LocalDateTime dataPedido) {
        this.dataPedido = dataPedido;
    }
    
    public StatusPedido getStatus() {
        return status;
    }
    
    public void setStatus(StatusPedido status) {
        this.status = status;
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    
    public BigDecimal getValorFrete() {
        return valorFrete;
    }
    
    public void setValorFrete(BigDecimal valorFrete) {
        this.valorFrete = valorFrete;
    }
    
    public BigDecimal getValorTotal() {
        return valorTotal;
    }
    
    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }
    
    public String getEnderecoEntregaCep() {
        return enderecoEntregaCep;
    }
    
    public void setEnderecoEntregaCep(String enderecoEntregaCep) {
        this.enderecoEntregaCep = enderecoEntregaCep;
    }
    
    public String getEnderecoEntregaLogradouro() {
        return enderecoEntregaLogradouro;
    }
    
    public void setEnderecoEntregaLogradouro(String enderecoEntregaLogradouro) {
        this.enderecoEntregaLogradouro = enderecoEntregaLogradouro;
    }
    
    public String getEnderecoEntregaNumero() {
        return enderecoEntregaNumero;
    }
    
    public void setEnderecoEntregaNumero(String enderecoEntregaNumero) {
        this.enderecoEntregaNumero = enderecoEntregaNumero;
    }
    
    public String getEnderecoEntregaComplemento() {
        return enderecoEntregaComplemento;
    }
    
    public void setEnderecoEntregaComplemento(String enderecoEntregaComplemento) {
        this.enderecoEntregaComplemento = enderecoEntregaComplemento;
    }
    
    public String getEnderecoEntregaBairro() {
        return enderecoEntregaBairro;
    }
    
    public void setEnderecoEntregaBairro(String enderecoEntregaBairro) {
        this.enderecoEntregaBairro = enderecoEntregaBairro;
    }
    
    public String getEnderecoEntregaCidade() {
        return enderecoEntregaCidade;
    }
    
    public void setEnderecoEntregaCidade(String enderecoEntregaCidade) {
        this.enderecoEntregaCidade = enderecoEntregaCidade;
    }
    
    public String getEnderecoEntregaUf() {
        return enderecoEntregaUf;
    }
    
    public void setEnderecoEntregaUf(String enderecoEntregaUf) {
        this.enderecoEntregaUf = enderecoEntregaUf;
    }
    
    public String getObservacoes() {
        return observacoes;
    }
    
    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }
    
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }
    
    public List<ItemPedido> getItens() {
        return itens;
    }
    
    public void setItens(List<ItemPedido> itens) {
        this.itens = itens;
    }
    
    // Métodos auxiliares
    public void adicionarItem(ItemPedido item) {
        itens.add(item);
        item.setPedido(this);
    }
    
    public void removerItem(ItemPedido item) {
        itens.remove(item);
        item.setPedido(null);
    }
}
