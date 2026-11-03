package com.ecocarbon.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "achievements", indexes = {
    @Index(name = "idx_achievement_user", columnList = "user_id")
})
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "badge_name", nullable = false, length = 100)
    private String badgeName;

    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Achievement() {
    }

    public Achievement(User user, String badgeName, LocalDateTime earnedAt) {
        this.user = user;
        this.badgeName = badgeName;
        this.earnedAt = earnedAt != null ? earnedAt : LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.earnedAt == null) {
            this.earnedAt = LocalDateTime.now();
        }
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

