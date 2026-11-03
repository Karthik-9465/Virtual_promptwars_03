package com.ecocarbon.controller;

import com.ecocarbon.dto.AnalyticsSummaryResponse;
import com.ecocarbon.security.UserPrincipal;
import com.ecocarbon.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(analyticsService.getSummary(user.getId()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsSummaryResponse> getDashboard(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(analyticsService.getSummary(user.getId()));
    }
}

