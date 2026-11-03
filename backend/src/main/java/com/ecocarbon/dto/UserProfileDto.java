package com.ecocarbon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class UserProfileDto {
    private Long id;
    private Long userId;
    private String ageGroup;
    private String location;
    private String diet;
    private String transportMode;
    private Double weeklyDistanceKm;
    private Double electricityKwhM;
    private Double acHoursPerDay;
    private Double flightHoursPerYear;
    private String shoppingFrequency;
    private Double wasteRecyclingRate;
    private Integer sustainabilityScore;
    private Integer xpPoints;
    private Integer streakDays;
    private LocalDateTime lastActiveDate;

    public UserProfileDto() {
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
}

