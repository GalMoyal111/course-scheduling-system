package com.coursescheduling.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Apply these rules to all server routes, such as /api/courses.
                .allowedOriginPatterns(
                        "http://localhost:*",    // Allow access from any local development port.
                        "https://*.vercel.app"   // Allow access from the deployed Vercel site.
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods.
                .allowedHeaders("*") // Allow all headers, including Firebase tokens.
                .allowCredentials(true);
    }
}
