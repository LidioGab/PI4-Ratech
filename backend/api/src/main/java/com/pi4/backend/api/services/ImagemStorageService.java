package com.pi4.backend.api.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImagemStorageService {

    private final Path rootDir;

    public ImagemStorageService() throws IOException {
        this.rootDir = Paths.get("uploads").toAbsolutePath().normalize();
        if (!Files.exists(rootDir)) {
            Files.createDirectories(rootDir);
        }
    }

    public StoredImage store(MultipartFile file, Long produtoId) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Arquivo vazio");
        }
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = "";
        int idx = original.lastIndexOf('.');
        if (idx >= 0) {
            ext = original.substring(idx).toLowerCase();
        }
        String novoNome = UUID.randomUUID().toString().replace("-", "") + ext;
        Path produtoDir = rootDir.resolve("produtos").resolve(String.valueOf(produtoId));
        if (!Files.exists(produtoDir)) {
            Files.createDirectories(produtoDir);
        }
        Path destino = produtoDir.resolve(novoNome);
        Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
        StoredImage stored = new StoredImage();
        stored.setNomeArquivo(novoNome);
        stored.setDiretorio("/uploads/produtos/" + produtoId + "/");
        return stored;
    }

    public boolean deleteFile(String diretorio, String nomeArquivo) {
        try {
            String sanitized = diretorio.startsWith("/") ? diretorio.substring(1) : diretorio;
            Path path = rootDir.getParent().resolve(sanitized).resolve(nomeArquivo).normalize();
            if (Files.exists(path)) {
                return Files.deleteIfExists(path);
            }
        } catch (IOException | SecurityException e) {
            return false;
        }
        return false;
    }

    public static class StoredImage {
        private String nomeArquivo;
        private String diretorio;
        public String getNomeArquivo() { return nomeArquivo; }
        public void setNomeArquivo(String nomeArquivo) { this.nomeArquivo = nomeArquivo; }
        public String getDiretorio() { return diretorio; }
        public void setDiretorio(String diretorio) { this.diretorio = diretorio; }
    }
}
