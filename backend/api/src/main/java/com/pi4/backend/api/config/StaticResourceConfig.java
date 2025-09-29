package com.pi4.backend.api.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String uploadPath = Paths.get("uploads").toAbsolutePath().toString().replace("\\", "/");
    if(!uploadPath.endsWith("/")) uploadPath += "/";
    // Spring requer prefixo file:
    registry.addResourceHandler("/uploads/**")
        .addResourceLocations("file:" + uploadPath)
        .setCachePeriod(3600);
    }
}
