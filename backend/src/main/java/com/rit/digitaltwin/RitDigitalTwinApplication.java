package com.rit.digitaltwin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class RitDigitalTwinApplication {

    public static void main(String[] args) {
        SpringApplication.run(RitDigitalTwinApplication.class, args);
    }
}
