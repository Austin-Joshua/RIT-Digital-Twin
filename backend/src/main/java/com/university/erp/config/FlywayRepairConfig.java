package com.university.erp.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Runs Flyway repair before every migration in prod.
 * This clears any "FAILED" rows in flyway_schema_history so that
 * the application can start cleanly even if a previous migration was
 * interrupted (e.g. V11__Ultra_Performance_Optimization.sql).
 */
@Configuration
@Profile("prod")
public class FlywayRepairConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return (Flyway flyway) -> {
            flyway.repair();   // removes failed migration records
            flyway.migrate();  // runs any pending migrations
        };
    }
}
