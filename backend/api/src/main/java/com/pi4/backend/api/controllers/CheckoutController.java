package com.pi4.backend.api.controllers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.repositories.ClienteRepository;
import com.pi4.backend.api.repositories.ProdutoRepository;
import com.pi4.backend.api.services.FreteService;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private FreteService freteService;

    // DTOs
    public static class ItemCarrinho {
        private Long produtoId;
        private Integer quantidade;
        private BigDecimal precoUnitario;

        // Getters e Setters
        public Long getProdutoId() { return produtoId; }
        public void setProdutoId(Long produtoId) { this.produtoId = produtoId; }
        public Integer getQuantidade() { return quantidade; }
        public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
        public BigDecimal getPrecoUnitario() { return precoUnitario; }
        public void setPrecoUnitario(BigDecimal precoUnitario) { this.precoUnitario = precoUnitario; }
    }

    public static class CheckoutRequest {
        private Integer clienteId;
        private List<ItemCarrinho> itens;
        private String cepEntrega;
        private Integer enderecoEntregaId;

        // Getters e Setters
        public Integer getClienteId() { return clienteId; }
        public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
        public List<ItemCarrinho> getItens() { return itens; }
        public void setItens(List<ItemCarrinho> itens) { this.itens = itens; }
        public String getCepEntrega() { return cepEntrega; }
        public void setCepEntrega(String cepEntrega) { this.cepEntrega = cepEntrega; }
        public Integer getEnderecoEntregaId() { return enderecoEntregaId; }
        public void setEnderecoEntregaId(Integer enderecoEntregaId) { this.enderecoEntregaId = enderecoEntregaId; }
    }

    public static class CheckoutResponse {
        private String pedidoId;
        private BigDecimal subtotal;
        private BigDecimal valorFrete;
        private BigDecimal total;
        private String status;
        private LocalDateTime dataCheckout;

        // Getters e Setters
        public String getPedidoId() { return pedidoId; }
        public void setPedidoId(String pedidoId) { this.pedidoId = pedidoId; }
        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
        public BigDecimal getValorFrete() { return valorFrete; }
        public void setValorFrete(BigDecimal valorFrete) { this.valorFrete = valorFrete; }
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getDataCheckout() { return dataCheckout; }
        public void setDataCheckout(LocalDateTime dataCheckout) { this.dataCheckout = dataCheckout; }
    }

    @PostMapping("/iniciar")
    public ResponseEntity<?> iniciarCheckout(@RequestBody CheckoutRequest request) {
        try {
            // Validar cliente
            if (request.getClienteId() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Cliente não autenticado");
            }

            Optional<Cliente> clienteOpt = clienteRepository.findById(request.getClienteId());
            if (!clienteOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
            }

            Cliente cliente = clienteOpt.get();
            if (!Boolean.TRUE.equals(cliente.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cliente inativo");
            }

            // Validar itens do carrinho
            if (request.getItens() == null || request.getItens().isEmpty()) {
                return ResponseEntity.badRequest().body("Carrinho vazio");
            }

            BigDecimal subtotal = BigDecimal.ZERO;
            
            // Validar produtos e calcular subtotal
            for (ItemCarrinho item : request.getItens()) {
                Optional<Produto> produtoOpt = produtoRepository.findById(item.getProdutoId());
                if (!produtoOpt.isPresent()) {
                    return ResponseEntity.badRequest().body("Produto não encontrado: " + item.getProdutoId());
                }

                Produto produto = produtoOpt.get();
                if (!Boolean.TRUE.equals(produto.getStatus())) {
                    return ResponseEntity.badRequest().body("Produto inativo: " + produto.getNome());
                }

                if (produto.getQuantidadeEstoque() < item.getQuantidade()) {
                    return ResponseEntity.badRequest().body("Estoque insuficiente para: " + produto.getNome());
                }

                // Usar preço atual do produto (não confiar no frontend)
                BigDecimal precoAtual = produto.getPreco();
                BigDecimal subtotalItem = precoAtual.multiply(new BigDecimal(item.getQuantidade()));
                subtotal = subtotal.add(subtotalItem);
            }

            // Calcular frete
            BigDecimal valorFrete = BigDecimal.ZERO;
            if (request.getCepEntrega() != null && !request.getCepEntrega().isEmpty()) {
                try {
                    var freteMap = freteService.calcularFretePorCep(request.getCepEntrega());
                    // Usar frete padrão (primeiro valor encontrado)
                    if (!freteMap.isEmpty()) {
                        valorFrete = BigDecimal.valueOf(freteMap.values().iterator().next());
                    }
                } catch (Exception e) {
                    // Se não conseguir calcular frete, continua com valor zero
                    valorFrete = BigDecimal.ZERO;
                }
            }

            BigDecimal total = subtotal.add(valorFrete);

            // Gerar ID do pedido (simulado)
            String pedidoId = "PED-" + System.currentTimeMillis();

            // Preparar resposta
            CheckoutResponse response = new CheckoutResponse();
            response.setPedidoId(pedidoId);
            response.setSubtotal(subtotal);
            response.setValorFrete(valorFrete);
            response.setTotal(total);
            response.setStatus("INICIADO");
            response.setDataCheckout(LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno do servidor");
        }
    }

    @PostMapping("/validar-cliente")
    public ResponseEntity<?> validarCliente(@RequestBody ValidarClienteRequest request) {
        try {
            if (request.getClienteId() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Cliente não autenticado");
            }

            Optional<Cliente> clienteOpt = clienteRepository.findById(request.getClienteId());
            if (!clienteOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
            }

            Cliente cliente = clienteOpt.get();
            if (!Boolean.TRUE.equals(cliente.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cliente inativo");
            }

            // Retornar dados básicos do cliente
            ClienteCheckoutDto clienteDto = new ClienteCheckoutDto();
            clienteDto.setId(cliente.getId());
            clienteDto.setNome(cliente.getNome());
            clienteDto.setEmail(cliente.getEmail());

            return ResponseEntity.ok(clienteDto);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno do servidor");
        }
    }

    public static class ValidarClienteRequest {
        private Integer clienteId;

        public Integer getClienteId() { return clienteId; }
        public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
    }

    public static class ClienteCheckoutDto {
        private Integer id;
        private String nome;
        private String email;

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    // Endpoint para finalizar pedido (criar pedido do checkout)
    @PostMapping("/finalizar")
    public ResponseEntity<?> finalizarPedido(@RequestBody CheckoutRequest request) {
        try {
            if (request.getClienteId() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Cliente não autenticado");
            }

            Cliente cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
            if (cliente == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
            }

            if (!cliente.getStatus()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cliente inativo");
            }

            if (request.getItens() == null || request.getItens().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Carrinho vazio");
            }

            // Redirecionar para o PedidoController para criar o pedido
            // Aqui retornamos sucesso e o frontend pode chamar a API de pedidos
            return ResponseEntity.ok().body("Checkout validado com sucesso. Redirecionando para criação do pedido.");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno do servidor");
        }
    }
}
