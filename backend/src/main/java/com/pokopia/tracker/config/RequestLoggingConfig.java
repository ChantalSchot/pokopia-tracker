package com.pokopia.tracker.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
public class RequestLoggingConfig {

    @Bean
    public OncePerRequestFilter requestLoggingFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain) throws ServletException, IOException {
                long start = System.currentTimeMillis();
                try {
                    chain.doFilter(request, response);
                } finally {
                    long duration = System.currentTimeMillis() - start;
                    // Skip noisy asset/actuator/swagger requests from the log
                    String uri = request.getRequestURI();
                    if (!uri.startsWith("/assets") && !uri.startsWith("/actuator")
                            && !uri.startsWith("/swagger") && !uri.startsWith("/v3/api-docs")) {
                        getLogger(RequestLoggingConfig.class).info(
                            "{} {} -> {} ({}ms)",
                            request.getMethod(), uri,
                            response.getStatus(), duration
                        );
                    }
                }
            }

            private org.slf4j.Logger getLogger(Class<?> clazz) {
                return org.slf4j.LoggerFactory.getLogger(clazz);
            }
        };
    }
}
