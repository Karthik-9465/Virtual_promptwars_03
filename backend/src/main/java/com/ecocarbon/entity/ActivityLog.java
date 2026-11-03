package com.ecocarbon.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs", indexes = {
    @Index(name = "idx_activity_user", columnList = "user_id")
})
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "action_name", nullable = false, length = 150)
    private String actionName;

    @Column(name = "xp_earned", nullable = false)
    private Integer xpEarned = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ActivityLog() {
    }

    public ActivityLog(User user, String actionName, Integer xpEarned) {
        this.user = user;
        this.actionName = actionName;
        this.xpEarned = xpEarned != null ? xpEarned : 0;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
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
}

