package com.university.erp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(@org.springframework.lang.NonNull MessageBrokerRegistry config) {
        // Use an in-memory message broker to send messages to clients on /topic
        config.enableSimpleBroker("/topic");
        // Prefix for messages sent FROM client TO server
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(@org.springframework.lang.NonNull StompEndpointRegistry registry) {
        // endpoint for clients to connect using SockJS
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
