package com.quizai.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

        @Bean
        public OpenAPI customOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("AI-Powered Adaptive Quiz Platform API")
                                                .version("1.0.0")
                                                .description("REST API for the AI-powered quiz platform. " +
                                                                "Supports JWT authentication, AI quiz generation, adaptive difficulty, "
                                                                +
                                                                "leaderboard, and admin management.")
                                                .contact(new Contact()
                                                                .name("QuizAI Platform")
                                                                .email("admin@quizai.com")))
                                .components(new Components()
                                                .addSecuritySchemes("bearerAuth",
                                                                new SecurityScheme()
                                                                                .type(SecurityScheme.Type.HTTP)
                                                                                .scheme("bearer")
                                                                                .bearerFormat("JWT")
                                                                                .description("Enter JWT token obtained from /api/auth/login")));
        }
}
