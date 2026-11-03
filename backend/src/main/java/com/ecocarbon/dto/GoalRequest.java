package com.ecocarbon.dto;

import java.time.LocalDate;

public class GoalRequest {
    private String title;
    private String category;
    private Double targetValue;
    private Double currentValue;
    private LocalDate endDate;
    private Boolean isCompleted;

    public GoalRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getTargetValue() {
        return targetValue;
    }

    public void setTargetValue(Double targetValue) {
        this.targetValue = targetValue;
    }

    public Double getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(Double currentValue) {
        this.currentValue = currentValue;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean completed) {
        isCompleted = completed;
    }
}

