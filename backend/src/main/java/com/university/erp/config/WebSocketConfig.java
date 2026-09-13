package com.university.erp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final CampusSocketAuthInterceptor campusSocketAuthInterceptor;

    @Value("${app.cors.allowed-origins}")
    private String allowedOriginsConfig;

    public WebSocketConfig(CampusSocketAuthInterceptor campusSocketAuthInterceptor) {
        this.campusSocketAuthInterceptor = campusSocketAuthInterceptor;
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(campusSocketAuthInterceptor);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Use an in-memory message broker to send messages to clients on /topic
        config.enableSimpleBroker("/topic");
        // Prefix for messages sent FROM client TO server
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // endpoint for clients to connect using SockJS
        java.util.List<String> origins = new java.util.ArrayList<>();
        origins.add("http://localhost:*");
        origins.add("http://127.0.0.1:*");
        origins.add("https://*.vercel.app");
        for (String origin : allowedOriginsConfig.split(",")) {
            String trimmed = origin.trim();
            if (!trimmed.isEmpty() && !origins.contains(trimmed)) {
                origins.add(trimmed);
            }
        }
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(origins.toArray(String[]::new))
                .withSockJS();
    }
}
