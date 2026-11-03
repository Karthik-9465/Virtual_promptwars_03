package com.ecocarbon.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsSummaryResponse {
    private Map<String, Object> profile;
    private List<FootprintRecordDto> footprints;
    private String aiInsights;
    private List<BadgeDto> badges;
    private Map<String, Long> goalsSummary;
    private List<ActivityLogDto> recentActivities;
    private List<RecommendationResponse> activeRecommendations;
    private List<NotificationResponse> recentNotifications;

    public AnalyticsSummaryResponse() {
    }

    public Map<String, Object> getProfile() {
        return profile;
    }

    public void setProfile(Map<String, Object> profile) {
        this.profile = profile;
    }

    public List<FootprintRecordDto> getFootprints() {
        return footprints;
    }

    public void setFootprints(List<FootprintRecordDto> footprints) {
        this.footprints = footprints;
    }

    public String getAiInsights() {
        return aiInsights;
    }

    public void setAiInsights(String aiInsights) {
        this.aiInsights = aiInsights;
    }

    public List<BadgeDto> getBadges() {
        return badges;
    }

    public void setBadges(List<BadgeDto> badges) {
        this.badges = badges;
    }

    public Map<String, Long> getGoalsSummary() {
        return goalsSummary;
    }

    public void setGoalsSummary(Map<String, Long> goalsSummary) {
        this.goalsSummary = goalsSummary;
    }

    public List<ActivityLogDto> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<ActivityLogDto> recentActivities) {
        this.recentActivities = recentActivities;
    }

    public List<RecommendationResponse> getActiveRecommendations() {
        return activeRecommendations;
    }

    public void setActiveRecommendations(List<RecommendationResponse> activeRecommendations) {
        this.activeRecommendations = activeRecommendations;
    }

    public List<NotificationResponse> getRecentNotifications() {
        return recentNotifications;
    }

    public void setRecentNotifications(List<NotificationResponse> recentNotifications) {
        this.recentNotifications = recentNotifications;
    }
}

