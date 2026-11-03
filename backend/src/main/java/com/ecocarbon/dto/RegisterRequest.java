package com.ecocarbon.dto;

public class RegisterRequest {
    private String email;
    private String password;
    private String name;
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

    public RegisterRequest() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
}

