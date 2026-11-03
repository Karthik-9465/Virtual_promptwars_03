package com.ecocarbon.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final DataSource dataSource;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping({"/health", "/actuator/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> body = new LinkedHashMap<>();
        boolean dbHealthy = false;

        try (Connection connection = dataSource.getConnection()) {
            dbHealthy = connection.isValid(2);
        } catch (Exception e) {
            dbHealthy = false;
        }

        if (dbHealthy) {
            body.put("status", "UP");
            body.put("database", "connected");
            body.put("environment", activeProfile);
            body.put("timestamp", Instant.now().toString());
            return ResponseEntity.ok(body);
        } else {
            body.put("status", "DOWN");
            body.put("database", "disconnected");
            body.put("environment", activeProfile);
            body.put("timestamp", Instant.now().toString());
            return new ResponseEntity<>(body, HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}

