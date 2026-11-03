package com.ecocarbon.dto;

import java.util.Map;

public class CarbonCalculationRequest {
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

    // Support nested payload format (for AWS format compatibility)
    private Map<String, Object> transport;
    private Map<String, Object> homeEnergy;
    private Map<String, Object> food;
    private Map<String, Object> shopping;
    private Map<String, Object> waste;

    public CarbonCalculationRequest() {
    }

    public String getAgeGroup() {
        return ageGroup;
    }

    public void setAgeGroup(String ageGroup) {
        this.ageGroup = ageGroup;
    }

    public String getLocation() {
        if (location != null) return location;
        if (homeEnergy != null && homeEnergy.containsKey("location")) {
            return String.valueOf(homeEnergy.get("location"));
        }
        return "India";
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDiet() {
        if (diet != null) return diet;
        if (food != null && food.containsKey("diet")) {
            return String.valueOf(food.get("diet"));
        }
        return "low_meat";
    }

    public void setDiet(String diet) {
        this.diet = diet;
    }

    public String getTransportMode() {
        if (transportMode != null) return transportMode;
        if (transport != null && transport.containsKey("mode")) {
            return String.valueOf(transport.get("mode"));
        }
        return "public";
    }

    public void setTransportMode(String transportMode) {
        this.transportMode = transportMode;
    }

    public Double getWeeklyDistanceKm() {
        if (weeklyDistanceKm != null) return weeklyDistanceKm;
        if (transport != null && transport.containsKey("weeklyDistanceKm")) {
            return parseDouble(transport.get("weeklyDistanceKm"), 0.0);
        }
        return 0.0;
    }

    public void setWeeklyDistanceKm(Double weeklyDistanceKm) {
        this.weeklyDistanceKm = weeklyDistanceKm;
    }

    public Double getElectricityKwhM() {
        if (electricityKwhM != null) return electricityKwhM;
        if (homeEnergy != null && homeEnergy.containsKey("electricityKwhM")) {
            return parseDouble(homeEnergy.get("electricityKwhM"), 0.0);
        }
        return 0.0;
    }

    public void setElectricityKwhM(Double electricityKwhM) {
        this.electricityKwhM = electricityKwhM;
    }

    public Double getAcHoursPerDay() {
        if (acHoursPerDay != null) return acHoursPerDay;
        if (homeEnergy != null && homeEnergy.containsKey("acHoursPerDay")) {
            return parseDouble(homeEnergy.get("acHoursPerDay"), 0.0);
        }
        return 0.0;
    }

    public void setAcHoursPerDay(Double acHoursPerDay) {
        this.acHoursPerDay = acHoursPerDay;
    }

    public Double getFlightHoursPerYear() {
        if (flightHoursPerYear != null) return flightHoursPerYear;
        if (transport != null && transport.containsKey("flightHoursPerYear")) {
            return parseDouble(transport.get("flightHoursPerYear"), 0.0);
        }
        return 0.0;
    }

    public void setFlightHoursPerYear(Double flightHoursPerYear) {
        this.flightHoursPerYear = flightHoursPerYear;
    }

    public String getShoppingFrequency() {
        if (shoppingFrequency != null) return shoppingFrequency;
        if (shopping != null && shopping.containsKey("frequency")) {
            return String.valueOf(shopping.get("frequency"));
        }
        return "medium";
    }

    public void setShoppingFrequency(String shoppingFrequency) {
        this.shoppingFrequency = shoppingFrequency;
    }

    public Double getWasteRecyclingRate() {
        if (wasteRecyclingRate != null) return wasteRecyclingRate;
        if (waste != null && waste.containsKey("recyclingRate")) {
            return parseDouble(waste.get("recyclingRate"), 0.0);
        }
        return 0.0;
    }

    public void setWasteRecyclingRate(Double wasteRecyclingRate) {
        this.wasteRecyclingRate = wasteRecyclingRate;
    }

    public Map<String, Object> getTransport() {
        return transport;
    }

    public void setTransport(Map<String, Object> transport) {
        this.transport = transport;
    }

    public Map<String, Object> getHomeEnergy() {
        return homeEnergy;
    }

    public void setHomeEnergy(Map<String, Object> homeEnergy) {
        this.homeEnergy = homeEnergy;
    }

    public Map<String, Object> getFood() {
        return food;
    }

    public void setFood(Map<String, Object> food) {
        this.food = food;
    }

    public Map<String, Object> getShopping() {
        return shopping;
    }

    public void setShopping(Map<String, Object> shopping) {
        this.shopping = shopping;
    }

    public Map<String, Object> getWaste() {
        return waste;
    }

    public void setWaste(Map<String, Object> waste) {
        this.waste = waste;
    }

    private static Double parseDouble(Object val, Double defaultVal) {
        if (val == null) return defaultVal;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try {
            return Double.parseDouble(String.valueOf(val));
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }
}

