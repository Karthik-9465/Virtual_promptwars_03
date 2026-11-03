package com.ecocarbon.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations", indexes = {
    @Index(name = "idx_rec_user_status", columnList = "user_id, status")
})
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String category; // 'transport', 'energy', 'food', 'shopping', 'waste'

    @Column(name = "co2_reduction", nullable = false)
    private Double co2Reduction;

    @Column(nullable = false, length = 20)
    private String difficulty; // 'low', 'medium', 'high'

    @Column(name = "estimated_savings", nullable = false)
    private Double estimatedSavings = 0.0;

    @Column(name = "time_required", nullable = false, length = 30)
    private String timeRequired; // 'immediate', 'short_term', 'long_term'

    @Column(name = "impact_score", nullable = false)
    private Double impactScore;

    @Column(nullable = false, length = 20)
    private String status = "active"; // 'active', 'completed', 'skipped'

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Recommendation() {
    }

    public Recommendation(User user, String title, String description, String category,
                          Double co2Reduction, String difficulty, Double estimatedSavings,
                          String timeRequired, Double impactScore, String status) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.category = category;
        this.co2Reduction = co2Reduction;
        this.difficulty = difficulty;
        this.estimatedSavings = estimatedSavings;
        this.timeRequired = timeRequired;
        this.impactScore = impactScore;
        this.status = status != null ? status : "active";
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getCo2Reduction() {
        return co2Reduction;
    }

    public void setCo2Reduction(Double co2Reduction) {
        this.co2Reduction = co2Reduction;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Double getEstimatedSavings() {
        return estimatedSavings;
    }

    public void setEstimatedSavings(Double estimatedSavings) {
        this.estimatedSavings = estimatedSavings;
    }

    public String getTimeRequired() {
        return timeRequired;
    }

    public void setTimeRequired(String timeRequired) {
        this.timeRequired = timeRequired;
    }

    public Double getImpactScore() {
        return impactScore;
    }

    public void setImpactScore(Double impactScore) {
        this.impactScore = impactScore;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

