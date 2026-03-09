package com.coursescheduling.server;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Global CORS configuration to allow requests from the frontend (e.g., React app running on localhost).
@Configuration
public class CorsConfig {
    // This configuration allows CORS requests to any endpoint under /api/** from any localhost port, which is useful for development.
    @Bean
    // In production, you would typically restrict allowed origins to the actual domain of your frontend.
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            //  Configure CORS to allow requests from the frontend during development.
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOriginPatterns("http://localhost:*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}