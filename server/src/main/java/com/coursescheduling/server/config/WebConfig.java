package com.coursescheduling.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // מחיל את החוקים על כל הראוטים בשרת שלנו (למשל /api/courses)
                .allowedOriginPatterns(
                        "http://localhost:*",    // מאפשר גישה מהמחשב שלך (מכל פורט לוקאלי)
                        "https://*.vercel.app"   // מאפשר גישה מהאתר שנעלה ל-Vercel
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // הפעולות המותרות
                .allowedHeaders("*") // מאפשר את כל ההדרים (כולל טוקנים של פיירבייס)
                .allowCredentials(true);
    }
}