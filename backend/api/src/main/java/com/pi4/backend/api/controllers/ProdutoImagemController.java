package com.pi4.backend.api.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.entities.ProdutoImagem;
import com.pi4.backend.api.repositories.ProdutoImagemRepository;
import com.pi4.backend.api.repositories.ProdutoRepository;
import com.pi4.backend.api.services.ImagemStorageService;
import com.pi4.backend.api.services.ImagemStorageService.StoredImage;

@RestController
@RequestMapping("/produtos/{id}/imagens")
public class ProdutoImagemController {

    private static final Logger log = LoggerFactory.getLogger(ProdutoImagemController.class);

    private final ProdutoRepository produtoRepository;
    private final ProdutoImagemRepository imagemRepository;
    private final ImagemStorageService storageService;

    public ProdutoImagemController(ProdutoRepository produtoRepository,
                                   ProdutoImagemRepository imagemRepository,
                                   ImagemStorageService storageService) {
        this.produtoRepository = produtoRepository;
        this.imagemRepository = imagemRepository;
        this.storageService = storageService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> upload(@PathVariable("id") Long produtoId,
                                    @RequestParam("files") List<MultipartFile> files,
                                    @RequestParam(value = "principalIndex", required = false) Integer principalIndex) {
        log.debug("Upload imagens produto={} totalArquivos={} principalIndex={}", produtoId, (files!=null?files.size():0), principalIndex);
        Optional<Produto> opt = produtoRepository.findById(produtoId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado");
        }
        Produto produto = opt.get();
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body("Nenhum arquivo enviado");
        }
        List<ProdutoImagem> salvas = new ArrayList<>();
        int idx = 0;
    final long MAX_FILE = 10L * 1024 * 1024; // 10MB
    for (MultipartFile f : files) {
            try {
                log.debug("Salvando arquivo {} ({} bytes)", f.getOriginalFilename(), f.getSize());
        if (f.getSize() > MAX_FILE) {
            log.warn("Arquivo excede limite: {} ({} bytes)", f.getOriginalFilename(), f.getSize());
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body("Arquivo excede limite de 10MB: " + f.getOriginalFilename());
        }
                StoredImage stored = storageService.store(f, produtoId);
                ProdutoImagem pi = new ProdutoImagem();
                pi.setProduto(produto);
                pi.setDiretorio(stored.getDiretorio());
                pi.setNomeArquivo(stored.getNomeArquivo());
                boolean principal = principalIndex != null && principalIndex == idx;
                pi.setImagemPrincipal(principal);
                imagemRepository.save(pi);
                salvas.add(pi);
            } catch (IOException e) {
                log.error("Falha salvando arquivo {}", f.getOriginalFilename(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Falha ao salvar arquivo: " + f.getOriginalFilename());
            }
            idx++;
        }
        // se principalIndex não informado e nenhuma existente, define primeira como principal
        if (principalIndex == null) {
            boolean existePrincipal = produto.getImagens().stream().anyMatch(ProdutoImagem::getImagemPrincipal);
            if (!existePrincipal && !salvas.isEmpty()) {
                salvas.get(0).setImagemPrincipal(true);
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(salvas);
    }

    @PutMapping("/{idImagem}/principal")
    @Transactional
    public ResponseEntity<?> definirPrincipal(@PathVariable("id") Long produtoId,
                                              @PathVariable("idImagem") Long idImagem) {
        Optional<Produto> optProd = produtoRepository.findById(produtoId);
        if (optProd.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado");
        Produto produto = optProd.get();
        Optional<ProdutoImagem> optImg = imagemRepository.findById(idImagem);
        if (optImg.isEmpty() || !optImg.get().getProduto().getId().equals(produtoId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Imagem não encontrada para este produto");
        }
        // zera anteriores
        produto.getImagens().forEach(im -> {
            if (Boolean.TRUE.equals(im.getImagemPrincipal())) {
                im.setImagemPrincipal(false);
            }
        });
        ProdutoImagem img = optImg.get();
        img.setImagemPrincipal(true);
        imagemRepository.save(img);
        return ResponseEntity.ok(img);
    }

    @DeleteMapping("/{idImagem}")
    @Transactional
    public ResponseEntity<?> remover(@PathVariable("id") Long produtoId,
                                     @PathVariable("idImagem") Long idImagem) {
        Optional<ProdutoImagem> opt = imagemRepository.findById(idImagem);
        if (opt.isEmpty() || !opt.get().getProduto().getId().equals(produtoId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Imagem não encontrada");
        }
        ProdutoImagem img = opt.get();
        imagemRepository.delete(img);
        return ResponseEntity.noContent().build();
    }
}
