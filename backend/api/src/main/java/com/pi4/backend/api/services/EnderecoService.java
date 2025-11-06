package com.pi4.backend.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pi4.backend.api.entities.Cliente;
import com.pi4.backend.api.entities.Endereco;
import com.pi4.backend.api.repositories.ClienteRepository;
import com.pi4.backend.api.repositories.EnderecoRepository;

@Service
public class EnderecoService {

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Endereco> listarPorCliente(Integer clienteId) {
        return enderecoRepository.findByClienteIdOrderByPrincipalDesc(clienteId);
    }

    public Endereco criarEndereco(Endereco endereco) {
        // Verificar se o cliente existe
        Cliente cliente = clienteRepository.findById(endereco.getCliente().getId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        endereco.setCliente(cliente);

        // Se for o primeiro endereço do cliente ou está marcado como principal
        List<Endereco> enderecosExistentes = enderecoRepository.findByClienteId(cliente.getId());
        if (enderecosExistentes.isEmpty() || (endereco.getPrincipal() != null && endereco.getPrincipal())) {
            // Desmarcar outros endereços como principal
            if (endereco.getPrincipal() != null && endereco.getPrincipal()) {
                enderecosExistentes.forEach(e -> {
                    e.setPrincipal(false);
                    enderecoRepository.save(e);
                });
            }
            
            if (enderecosExistentes.isEmpty()) {
                endereco.setPrincipal(true);
            }
        }

        return enderecoRepository.save(endereco);
    }

    public Endereco atualizarEndereco(Endereco endereco) {
        Endereco enderecoExistente = enderecoRepository.findById(endereco.getId())
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        enderecoExistente.setLogradouro(endereco.getLogradouro());
        enderecoExistente.setNumero(endereco.getNumero());
        enderecoExistente.setComplemento(endereco.getComplemento());
        enderecoExistente.setBairro(endereco.getBairro());
        enderecoExistente.setCidade(endereco.getCidade());
        enderecoExistente.setEstado(endereco.getEstado());
        enderecoExistente.setCep(endereco.getCep());

        // Se está sendo marcado como principal
        if (endereco.getPrincipal() != null && endereco.getPrincipal()) {
            // Desmarcar outros endereços como principal
            List<Endereco> outrosEnderecos = enderecoRepository.findByClienteId(enderecoExistente.getCliente().getId());
            outrosEnderecos.forEach(e -> {
                if (!e.getId().equals(endereco.getId())) {
                    e.setPrincipal(false);
                    enderecoRepository.save(e);
                }
            });
            enderecoExistente.setPrincipal(true);
        }

        return enderecoRepository.save(enderecoExistente);
    }

    public void deletarEndereco(Long enderecoId) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        Integer clienteId = endereco.getCliente().getId();
        boolean eraPrincipal = endereco.getPrincipal() != null && endereco.getPrincipal();
        
        enderecoRepository.delete(endereco);

        // Se era principal, marcar outro como principal
        if (eraPrincipal) {
            List<Endereco> enderecosRestantes = enderecoRepository.findByClienteId(clienteId);
            if (!enderecosRestantes.isEmpty()) {
                enderecosRestantes.get(0).setPrincipal(true);
                enderecoRepository.save(enderecosRestantes.get(0));
            }
        }
    }

    public Endereco buscarPrincipal(Integer clienteId) {
        return enderecoRepository.findPrincipalByClienteId(clienteId);
    }
}
