package com.ecocarbon.controller;

import com.ecocarbon.dto.RecommendationActionRequest;
import com.ecocarbon.dto.RecommendationResponse;
import com.ecocarbon.security.UserPrincipal;
import com.ecocarbon.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(recommendationService.generateForUser(user.getId()));
    }

    @PostMapping("/action")
    public ResponseEntity<Map<String, Object>> performAction(@AuthenticationPrincipal UserPrincipal user,
                                                             @RequestBody RecommendationActionRequest request) {
        return ResponseEntity.ok(recommendationService.performAction(user.getId(), request.getRecommendationId(), request.getStatus()));
    }

    @PostMapping("/regenerate")
    public ResponseEntity<Map<String, Object>> regenerate(@AuthenticationPrincipal UserPrincipal user) {
        List<RecommendationResponse> recs = recommendationService.regenerate(user.getId());
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Recommendations successfully regenerated");
        response.put("recommendations", recs);
        return ResponseEntity.ok(response);
    }
}

