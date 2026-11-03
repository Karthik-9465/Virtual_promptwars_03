package com.ecocarbon.dto;

public class RecommendationActionRequest {
    private Long recommendationId;
    private String status; // 'completed' or 'skipped'

    public RecommendationActionRequest() {
    }

    public Long getRecommendationId() {
        return recommendationId;
    }

    public void setRecommendationId(Long recommendationId) {
        this.recommendationId = recommendationId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

