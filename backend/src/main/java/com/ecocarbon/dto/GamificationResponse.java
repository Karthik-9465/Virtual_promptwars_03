package com.ecocarbon.dto;

import java.util.ArrayList;
import java.util.List;

public class GamificationResponse {
    private Integer xpPoints;
    private Integer level;
    private Integer streakDays;
    private List<String> newlyUnlockedBadges = new ArrayList<>();

    public GamificationResponse() {
    }

    public GamificationResponse(Integer xpPoints, Integer level, Integer streakDays, List<String> newlyUnlockedBadges) {
        this.xpPoints = xpPoints;
        this.level = level;
        this.streakDays = streakDays;
        this.newlyUnlockedBadges = newlyUnlockedBadges != null ? newlyUnlockedBadges : new ArrayList<>();
    }

    public Integer getXpPoints() {
        return xpPoints;
    }

    public void setXpPoints(Integer xpPoints) {
        this.xpPoints = xpPoints;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getStreakDays() {
        return streakDays;
    }

    public void setStreakDays(Integer streakDays) {
        this.streakDays = streakDays;
    }

    public List<String> getNewlyUnlockedBadges() {
        return newlyUnlockedBadges;
    }

    public void setNewlyUnlockedBadges(List<String> newlyUnlockedBadges) {
        this.newlyUnlockedBadges = newlyUnlockedBadges;
    }
}

