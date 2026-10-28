package com.university.erp.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

/**
 * Runs Flyway repair before every migration.
 * This clears any "FAILED" rows in flyway_schema_history so that
 * the application can start cleanly even if a previous migration was
 * interrupted or schema checksums were realigned.
 */
@Configuration
@Slf4j
public class FlywayRepairConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return (Flyway flyway) -> {
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
