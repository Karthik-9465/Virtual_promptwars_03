package com.ecocarbon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class ActivityLogDto {
    private Long id;
    private Long userId;
    private String actionName;
    private Integer xpEarned;
    private LocalDateTime createdAt;

    public ActivityLogDto() {
    }

    public ActivityLogDto(Long id, Long userId, String actionName, Integer xpEarned, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.actionName = actionName;
        this.xpEarned = xpEarned;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @JsonProperty("_id")
    public String getMongoId() {
        return id != null ? id.toString() : null;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getActionName() {
        return actionName;
    }

    public void setActionName(String actionName) {
        this.actionName = actionName;
    }

    public Integer getXpEarned() {
        return xpEarned;
    }

    public void setXpEarned(Integer xpEarned) {
        this.xpEarned = xpEarned;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

