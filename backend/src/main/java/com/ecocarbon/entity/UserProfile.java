package com.ecocarbon.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "age_group", nullable = false, length = 50)
    private String ageGroup = "professional";

    @Column(nullable = false, length = 100)
    private String location = "India";

    @Column(nullable = false, length = 50)
    private String diet = "low_meat";

    @Column(name = "transport_mode", nullable = false, length = 50)
    private String transportMode = "car_petrol";

    @Column(name = "weekly_distance_km", nullable = false)
    private Double weeklyDistanceKm = 0.0;

    @Column(name = "electricity_kwh_m", nullable = false)
    private Double electricityKwhM = 0.0;

    @Column(name = "ac_hours_per_day", nullable = false)
    private Double acHoursPerDay = 0.0;

    @Column(name = "flight_hours_per_year", nullable = false)
    private Double flightHoursPerYear = 0.0;

    @Column(name = "shopping_frequency", nullable = false, length = 50)
    private String shoppingFrequency = "medium";

    @Column(name = "waste_recycling_rate", nullable = false)
    private Double wasteRecyclingRate = 0.0;

    @Column(name = "sustainability_score", nullable = false)
    private Integer sustainabilityScore = 50;

    @Column(name = "xp_points", nullable = false)
    private Integer xpPoints = 0;

    @Column(name = "streak_days", nullable = false)
    private Integer streakDays = 0;

    @Column(name = "last_active_date", nullable = false)
    private LocalDateTime lastActiveDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UserProfile() {
    }

    public UserProfile(User user) {
        this.user = user;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.lastActiveDate == null) {
            this.lastActiveDate = LocalDateTime.now();
        }
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

    public String getAgeGroup() {
        return ageGroup;
    }

    public void setAgeGroup(String ageGroup) {
        this.ageGroup = ageGroup;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDiet() {
        return diet;
    }

    public void setDiet(String diet) {
        this.diet = diet;
    }

    public String getTransportMode() {
        return transportMode;
    }

    public void setTransportMode(String transportMode) {
        this.transportMode = transportMode;
    }

    public Double getWeeklyDistanceKm() {
        return weeklyDistanceKm;
    }

    public void setWeeklyDistanceKm(Double weeklyDistanceKm) {
        this.weeklyDistanceKm = weeklyDistanceKm;
    }

    public Double getElectricityKwhM() {
        return electricityKwhM;
    }

    public void setElectricityKwhM(Double electricityKwhM) {
        this.electricityKwhM = electricityKwhM;
    }

    public Double getAcHoursPerDay() {
        return acHoursPerDay;
    }

    public void setAcHoursPerDay(Double acHoursPerDay) {
        this.acHoursPerDay = acHoursPerDay;
    }

    public Double getFlightHoursPerYear() {
        return flightHoursPerYear;
    }

    public void setFlightHoursPerYear(Double flightHoursPerYear) {
        this.flightHoursPerYear = flightHoursPerYear;
    }

    public String getShoppingFrequency() {
        return shoppingFrequency;
    }

    public void setShoppingFrequency(String shoppingFrequency) {
        this.shoppingFrequency = shoppingFrequency;
    }

    public Double getWasteRecyclingRate() {
        return wasteRecyclingRate;
    }

    public void setWasteRecyclingRate(Double wasteRecyclingRate) {
        this.wasteRecyclingRate = wasteRecyclingRate;
    }

    public Integer getSustainabilityScore() {
        return sustainabilityScore;
    }

    public void setSustainabilityScore(Integer sustainabilityScore) {
        this.sustainabilityScore = sustainabilityScore;
    }

    public Integer getXpPoints() {
        return xpPoints;
    }

    public void setXpPoints(Integer xpPoints) {
        this.xpPoints = xpPoints;
    }

    public Integer getStreakDays() {
        return streakDays;
    }

    public void setStreakDays(Integer streakDays) {
        this.streakDays = streakDays;
    }

    public LocalDateTime getLastActiveDate() {
        return lastActiveDate;
    }

    public void setLastActiveDate(LocalDateTime lastActiveDate) {
        this.lastActiveDate = lastActiveDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

