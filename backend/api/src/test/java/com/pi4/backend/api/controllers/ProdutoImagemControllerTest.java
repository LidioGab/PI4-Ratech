package com.pi4.backend.api.controllers;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.pi4.backend.api.entities.Produto;
import com.pi4.backend.api.entities.ProdutoImagem;
import com.pi4.backend.api.repositories.ProdutoImagemRepository;
import com.pi4.backend.api.repositories.ProdutoRepository;
import com.pi4.backend.api.services.ImagemStorageService;
import com.pi4.backend.api.services.ImagemStorageService.StoredImage;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ProdutoImagemController")
class ProdutoImagemControllerTest {

    @Mock
    private ProdutoImagemRepository imagemRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private ImagemStorageService storageService;

    @Mock
    private MultipartFile mockFile;

    @InjectMocks
    private ProdutoImagemController produtoImagemController;

    private Produto produto;
    private ProdutoImagem imagem;

    @BeforeEach
    void setUp() {
        produto = new Produto();
        produto.setNome("Mouse Gamer");
        try {
            Field idField = Produto.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(produto, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        imagem = new ProdutoImagem();
        imagem.setProduto(produto);
        imagem.setDiretorio("uploads/produtos/1");
        imagem.setNomeArquivo("imagem1.jpg");
        imagem.setImagemPrincipal(true);
    }

    @Test
    @DisplayName("Deve retornar erro quando produto não encontrado no upload")
    void deveRetornarErroQuandoProdutoNaoEncontradoNoUpload() throws Exception {
        // Arrange
        when(produtoRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = produtoImagemController.upload(999L, Arrays.asList(mockFile), null);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve retornar erro quando nenhum arquivo enviado")
    void deveRetornarErroQuandoNenhumArquivoEnviado() throws Exception {
        // Arrange
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        // Act
        ResponseEntity<?> response = produtoImagemController.upload(1L, null, null);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve fazer upload de imagem com sucesso")
    void deveFazerUploadDeImagemComSucesso() throws Exception {
        // Arrange
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(mockFile.getSize()).thenReturn(1024L * 1024L); // 1MB
        when(mockFile.getOriginalFilename()).thenReturn("imagem.jpg");
        
        StoredImage storedImage = new StoredImage();
        storedImage.setDiretorio("uploads/produtos/1");
        storedImage.setNomeArquivo("imagem1.jpg");
        when(storageService.store(any(MultipartFile.class), anyLong())).thenReturn(storedImage);
        when(imagemRepository.save(any(ProdutoImagem.class))).thenReturn(imagem);

        // Act
        ResponseEntity<?> response = produtoImagemController.upload(1L, Arrays.asList(mockFile), 0);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(storageService, times(1)).store(any(MultipartFile.class), anyLong());
        verify(imagemRepository, times(1)).save(any(ProdutoImagem.class));
    }

    @Test
    @DisplayName("Deve retornar erro quando arquivo excede tamanho máximo")
    void deveRetornarErroQuandoArquivoExcedeTamanhoMaximo() throws Exception {
        // Arrange
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(mockFile.getSize()).thenReturn(11L * 1024L * 1024L); // 11MB (excede limite de 10MB)
        when(mockFile.getOriginalFilename()).thenReturn("imagem-grande.jpg");

        // Act
        ResponseEntity<?> response = produtoImagemController.upload(1L, Arrays.asList(mockFile), null);

        // Assert
        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve definir primeira imagem como principal quando não especificado")
    void deveDefinirPrimeiraImagemComoPrincipalQuandoNaoEspecificado() throws Exception {
        // Arrange
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(mockFile.getSize()).thenReturn(1024L * 1024L);
        when(mockFile.getOriginalFilename()).thenReturn("imagem.jpg");
        
        StoredImage storedImage = new StoredImage();
        storedImage.setDiretorio("uploads/produtos/1");
        storedImage.setNomeArquivo("imagem1.jpg");
        when(storageService.store(any(MultipartFile.class), anyLong())).thenReturn(storedImage);
        when(imagemRepository.save(any(ProdutoImagem.class))).thenReturn(imagem);

        // Act
        ResponseEntity<?> response = produtoImagemController.upload(1L, Arrays.asList(mockFile), null);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(imagemRepository, times(1)).save(any(ProdutoImagem.class));
    }

    @Test
    @DisplayName("Deve alterar imagem principal com sucesso")
    void deveAlterarImagemPrincipalComSucesso() {
        // Arrange
        ProdutoImagem imagemAtual = new ProdutoImagem();
        imagemAtual.setProduto(produto);
        imagemAtual.setImagemPrincipal(true);
        
        ProdutoImagem novaImagem = new ProdutoImagem();
        novaImagem.setProduto(produto);
        novaImagem.setImagemPrincipal(false);

        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(imagemRepository.findById(2L)).thenReturn(Optional.of(novaImagem));
        when(imagemRepository.save(any(ProdutoImagem.class))).thenReturn(novaImagem);

        // Act
        ResponseEntity<?> response = produtoImagemController.definirPrincipal(1L, 2L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(imagemRepository, atLeastOnce()).save(any(ProdutoImagem.class));
    }

    @Test
    @DisplayName("Deve retornar erro ao definir principal para produto inexistente")
    void deveRetornarErroAoDefinirPrincipalParaProdutoInexistente() {
        // Arrange
        when(produtoRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = produtoImagemController.definirPrincipal(999L, 1L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(imagemRepository, never()).save(any(ProdutoImagem.class));
    }

    @Test
    @DisplayName("Deve retornar erro ao definir principal para imagem inexistente")
    void deveRetornarErroAoDefinirPrincipalParaImagemInexistente() {
        // Arrange
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(imagemRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = produtoImagemController.definirPrincipal(1L, 999L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(imagemRepository, never()).save(any(ProdutoImagem.class));
    }

    @Test
    @DisplayName("Deve validar tamanho de arquivo")
    void deveValidarTamanhoDeArquivo() {
        // Arrange
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(mockFile.getSize()).thenReturn(15L * 1024L * 1024L); // 15MB
        when(mockFile.getOriginalFilename()).thenReturn("arquivo-grande.jpg");

        // Act
        ResponseEntity<?> response = produtoImagemController.upload(1L, Arrays.asList(mockFile), null);

        // Assert
        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, response.getStatusCode());
    }
}
