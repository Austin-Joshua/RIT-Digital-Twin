package com.university.erp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Architectural Decoupling: Dedicated Worker Pool Configuration.
 * Isolates compute-intensive Spatial Simulations and AI Copilot analytical jobs
 * from the transactional Tomcat thread pool to ensure zero CPU/thread contention
 * with student exam fees, marks uploads, and gradebook requests.
 */
@Configuration
@EnableAsync
public class SimulationAsyncWorkerConfig {

    @Bean(name = "simulationExecutor")
    public Executor simulationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("sim-worker-");
        executor.setThreadPriority(Thread.NORM_PRIORITY - 1); // Lower priority than ERP HTTP requests
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    @Bean(name = "aiCopilotExecutor")
    public Executor aiCopilotExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(3);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("ai-copilot-");
        executor.setThreadPriority(Thread.NORM_PRIORITY - 1);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
