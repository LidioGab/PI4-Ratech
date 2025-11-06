package com.pi4.backend.api.controllers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.entities.ItemPedido;
import com.pi4.backend.api.entities.Pedido;
import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.repositories.CarrinhoRepository;
import com.pi4.backend.api.repositories.ClienteRepository;
import com.pi4.backend.api.repositories.ItemPedidoRepository;
import com.pi4.backend.api.repositories.PedidoRepository;
import com.pi4.backend.api.repositories.ProdutoRepository;
import com.pi4.backend.api.services.FreteService;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private ItemPedidoRepository itemPedidoRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private ProdutoRepository produtoRepository;
    
    @Autowired
    private CarrinhoRepository carrinhoRepository;
    
    @Autowired
    private FreteService freteService;
    
    // DTO para criação de pedido
    public static class CriarPedidoRequest {
        private Integer clienteId;
        private List<ItemPedidoDto> itens;
        private String cepEntrega;
        private String enderecoEntregaLogradouro;
        private String enderecoEntregaNumero;
        private String enderecoEntregaComplemento;
        private String enderecoEntregaBairro;
        private String enderecoEntregaCidade;
        private String enderecoEntregaUf;
        private String observacoes;
    // Opcional: valor de frete escolhido pelo cliente (em centavos/valor decimal)
    private java.math.BigDecimal valorFreteEscolhido;
        
        // Getters e Setters
        public Integer getClienteId() { return clienteId; }
        public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
        public List<ItemPedidoDto> getItens() { return itens; }
        public void setItens(List<ItemPedidoDto> itens) { this.itens = itens; }
        public String getCepEntrega() { return cepEntrega; }
        public void setCepEntrega(String cepEntrega) { this.cepEntrega = cepEntrega; }
        public String getEnderecoEntregaLogradouro() { return enderecoEntregaLogradouro; }
        public void setEnderecoEntregaLogradouro(String enderecoEntregaLogradouro) { this.enderecoEntregaLogradouro = enderecoEntregaLogradouro; }
        public String getEnderecoEntregaNumero() { return enderecoEntregaNumero; }
        public void setEnderecoEntregaNumero(String enderecoEntregaNumero) { this.enderecoEntregaNumero = enderecoEntregaNumero; }
        public String getEnderecoEntregaComplemento() { return enderecoEntregaComplemento; }
        public void setEnderecoEntregaComplemento(String enderecoEntregaComplemento) { this.enderecoEntregaComplemento = enderecoEntregaComplemento; }
        public String getEnderecoEntregaBairro() { return enderecoEntregaBairro; }
        public void setEnderecoEntregaBairro(String enderecoEntregaBairro) { this.enderecoEntregaBairro = enderecoEntregaBairro; }
        public String getEnderecoEntregaCidade() { return enderecoEntregaCidade; }
        public void setEnderecoEntregaCidade(String enderecoEntregaCidade) { this.enderecoEntregaCidade = enderecoEntregaCidade; }
        public String getEnderecoEntregaUf() { return enderecoEntregaUf; }
        public void setEnderecoEntregaUf(String enderecoEntregaUf) { this.enderecoEntregaUf = enderecoEntregaUf; }
        public String getObservacoes() { return observacoes; }
        public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
        public java.math.BigDecimal getValorFreteEscolhido() { return valorFreteEscolhido; }
        public void setValorFreteEscolhido(java.math.BigDecimal valorFreteEscolhido) { this.valorFreteEscolhido = valorFreteEscolhido; }
    }
    
    public static class ItemPedidoDto {
        private Long produtoId;
        private Integer quantidade;
        private BigDecimal precoUnitario;
        
        public Long getProdutoId() { return produtoId; }
        public void setProdutoId(Long produtoId) { this.produtoId = produtoId; }
        public Integer getQuantidade() { return quantidade; }
        public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
        public BigDecimal getPrecoUnitario() { return precoUnitario; }
        public void setPrecoUnitario(BigDecimal precoUnitario) { this.precoUnitario = precoUnitario; }
    }
    
    public static class AtualizarStatusRequest {
        private Pedido.StatusPedido status;
        
        public Pedido.StatusPedido getStatus() { return status; }
        public void setStatus(Pedido.StatusPedido status) { this.status = status; }
    }
    
    // Criar pedido
    @PostMapping
    @Transactional
    public ResponseEntity<?> criarPedido(@RequestBody CriarPedidoRequest request) {
        try {
            if (request.getClienteId() == null) {
                return ResponseEntity.status(400).body("Cliente ID é obrigatório");
            }
            
            if (request.getItens() == null || request.getItens().isEmpty()) {
                return ResponseEntity.status(400).body("Itens do pedido são obrigatórios");
            }
            
            Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElse(null);
            if (cliente == null) {
                return ResponseEntity.status(404).body("Cliente não encontrado");
            }
            
            if (!cliente.getStatus()) {
                return ResponseEntity.status(403).body("Cliente inativo");
            }
            
            // Gerar número do pedido
            String numeroPedido = gerarNumeroPedido();
            
            // Criar pedido
            Pedido pedido = new Pedido(cliente, numeroPedido);
            pedido.setEnderecoEntregaCep(request.getCepEntrega());
            pedido.setEnderecoEntregaLogradouro(request.getEnderecoEntregaLogradouro());
            pedido.setEnderecoEntregaNumero(request.getEnderecoEntregaNumero());
            pedido.setEnderecoEntregaComplemento(request.getEnderecoEntregaComplemento());
            pedido.setEnderecoEntregaBairro(request.getEnderecoEntregaBairro());
            pedido.setEnderecoEntregaCidade(request.getEnderecoEntregaCidade());
            pedido.setEnderecoEntregaUf(request.getEnderecoEntregaUf());
            pedido.setObservacoes(request.getObservacoes());
            
            BigDecimal subtotal = BigDecimal.ZERO;
            
            // Validar e adicionar itens
            for (ItemPedidoDto itemDto : request.getItens()) {
                Produto produto = produtoRepository.findById(itemDto.getProdutoId())
                    .orElse(null);
                if (produto == null) {
                    return ResponseEntity.status(400)
                        .body("Produto não encontrado: " + itemDto.getProdutoId());
                }
                
                if (!produto.getStatus()) {
                    return ResponseEntity.status(400)
                        .body("Produto inativo: " + produto.getNome());
                }
                
                if (produto.getQuantidadeEstoque() < itemDto.getQuantidade()) {
                    return ResponseEntity.status(400)
                        .body("Estoque insuficiente para: " + produto.getNome());
                }
                
                // Criar item do pedido
                ItemPedido itemPedido = new ItemPedido(pedido, produto, 
                    itemDto.getQuantidade(), itemDto.getPrecoUnitario());
                
                pedido.adicionarItem(itemPedido);
                subtotal = subtotal.add(itemPedido.getSubtotal());
                
                // Atualizar estoque
                produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() - itemDto.getQuantidade());
                produtoRepository.save(produto);
            }
            
            // Calcular frete (usar valor escolhido pelo cliente se enviado, caso contrário usar serviço/fallback)
            BigDecimal valorFrete = BigDecimal.ZERO;

            if (request.getValorFreteEscolhido() != null) {
                valorFrete = request.getValorFreteEscolhido();
            } else {
                var freteInfo = freteService.calcularFretePorCep(request.getCepEntrega());

                if (freteInfo != null && freteInfo.get("padrao") != null) {
                    Object padraoObj = freteInfo.get("padrao");
                    if (padraoObj instanceof Number) {
                        valorFrete = BigDecimal.valueOf(((Number) padraoObj).doubleValue());
                    } else {
                        try {
                            valorFrete = new BigDecimal(padraoObj.toString());
                        } catch (Exception e) {
                            // Se conversão falhar, usar fallback
                            System.out.println("Aviso: valor de frete inválido retornado pelo serviço de frete. Usando valor fictício.");
                        }
                    }
                }

                if (valorFrete.compareTo(BigDecimal.ZERO) == 0) {
                    // Fallback: frete fictício = max( R$10.00, 10% do subtotal )
                    BigDecimal percentual = subtotal.multiply(new BigDecimal("0.10"));
                    BigDecimal minimo = new BigDecimal("10.00");
                    BigDecimal calculado = percentual.setScale(2, RoundingMode.HALF_UP);
                    valorFrete = calculado.compareTo(minimo) < 0 ? minimo : calculado;
                    System.out.println("Aviso: serviço de frete indisponível ou sem valor. Aplicando frete fictício: R$ " + valorFrete);
                }
            }
            
            pedido.setSubtotal(subtotal);
            pedido.setValorFrete(valorFrete);
            pedido.setValorTotal(subtotal.add(valorFrete));
            
            // Salvar pedido
            Pedido pedidoSalvo = pedidoRepository.save(pedido);
            
            // Limpar carrinho do cliente
            carrinhoRepository.deleteByClienteId(request.getClienteId());
            
            return ResponseEntity.status(201).body(pedidoSalvo);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    // Listar pedidos do cliente
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<?> listarPedidosCliente(
            @PathVariable Integer clienteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (!clienteRepository.existsById(clienteId)) {
                return ResponseEntity.status(404).body("Cliente não encontrado");
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Pedido> pedidos = pedidoRepository.findByClienteIdOrderByDataPedidoDesc(clienteId, pageable);
            
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    // Buscar pedido por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPedido(@PathVariable Long id) {
        try {
            Optional<Pedido> pedido = pedidoRepository.findById(id);
            if (pedido.isEmpty()) {
                return ResponseEntity.status(404).body("Pedido não encontrado");
            }
            
            return ResponseEntity.ok(pedido.get());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    // Buscar pedido por número
    @GetMapping("/numero/{numeroPedido}")
    public ResponseEntity<?> buscarPedidoPorNumero(@PathVariable String numeroPedido) {
        try {
            Optional<Pedido> pedido = pedidoRepository.findByNumeroPedido(numeroPedido);
            if (pedido.isEmpty()) {
                return ResponseEntity.status(404).body("Pedido não encontrado");
            }
            
            return ResponseEntity.ok(pedido.get());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    // Atualizar status do pedido
    @PutMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(
            @PathVariable Long id,
            @RequestBody AtualizarStatusRequest request) {
        try {
            Optional<Pedido> pedidoOpt = pedidoRepository.findById(id);
            if (pedidoOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Pedido não encontrado");
            }
            
            Pedido pedido = pedidoOpt.get();
            pedido.setStatus(request.getStatus());
            
            Pedido pedidoAtualizado = pedidoRepository.save(pedido);
            return ResponseEntity.ok(pedidoAtualizado);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    // Listar todos os pedidos (admin)
    @GetMapping("/admin")
    public ResponseEntity<?> listarTodosPedidos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Pedido> pedidos;
            
            if (status != null && !status.isEmpty()) {
                try {
                    Pedido.StatusPedido statusEnum = Pedido.StatusPedido.valueOf(status.toUpperCase());
                    pedidos = pedidoRepository.findByStatusOrderByDataPedidoDesc(statusEnum, pageable);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(400).body("Status inválido");
                }
            } else {
                pedidos = pedidoRepository.findAll(pageable);
            }
            
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    // Método auxiliar para gerar número do pedido
    private String gerarNumeroPedido() {
        LocalDateTime agora = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        return "PED" + agora.format(formatter) + String.format("%03d", (int)(Math.random() * 1000));
    }
}
