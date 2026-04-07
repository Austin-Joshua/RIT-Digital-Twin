package com.university.erp.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class KeepAliveService {

    @Value("${app.external-url:https://rit-backend-0zvm.onrender.com}")
    private String externalUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Pings the backend's own health endpoint every 10 minutes (600,000 ms) 
     * to prevent Render's free tier from spinning down due to inactivity.
     */
    @Scheduled(fixedRate = 600000)
    public void keepAlive() {
        try {
            String healthUrl = externalUrl + "/actuator/health";
            log.info("Sending keep-alive ping to: {}", healthUrl);
            String response = restTemplate.getForObject(healthUrl, String.class);
            log.info("Keep-alive ping successful: {}", response);
        } catch (Exception e) {
            log.warn("Keep-alive ping failed: {}. This is expected if the app is starting up.", e.getMessage());
        }
    }
}
