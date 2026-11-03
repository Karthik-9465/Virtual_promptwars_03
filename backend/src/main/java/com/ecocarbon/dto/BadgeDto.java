package com.ecocarbon.dto;

import java.time.LocalDateTime;

public class BadgeDto {
    private String badgeName;
    private LocalDateTime earnedAt;

    public BadgeDto() {
    }

    public BadgeDto(String badgeName, LocalDateTime earnedAt) {
        this.badgeName = badgeName;
        this.earnedAt = earnedAt;
    }

    public String getBadgeName() {
        return badgeName;
    }

    public void setBadgeName(String badgeName) {
        this.badgeName = badgeName;
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }

    public void setEarnedAt(LocalDateTime earnedAt) {
        this.earnedAt = earnedAt;
    }
}

