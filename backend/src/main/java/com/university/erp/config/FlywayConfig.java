package com.university.erp.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            log.info("Flyway: Executing repair prior to migration to ensure clean schema history...");
            try {
                flyway.repair();
                log.info("Flyway: Repair completed successfully.");
            } catch (Exception e) {
                log.warn("Flyway: Repair notice: {}", e.getMessage());
            }
            log.info("Flyway: Executing migrate...");
            flyway.migrate();
            log.info("Flyway: Migration completed successfully.");
        };
    }
}
