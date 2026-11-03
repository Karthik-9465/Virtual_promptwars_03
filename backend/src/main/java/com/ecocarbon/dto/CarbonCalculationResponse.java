package com.ecocarbon.dto;

import java.util.List;
import java.util.Map;

public class CarbonCalculationResponse {
    private Double totalCarbon;
    private Double transportEmissions;
    private Double energyEmissions;
    private Double foodEmissions;
    private Double shoppingEmissions;
    private Double wasteEmissions;
    private Double totalEmissions;
    private Integer sustainabilityScore;
    private String largestSource;
    private Map<String, Double> breakdown;
    private List<Map<String, Object>> recommendations;
    private Map<String, Object> metadata;

    public CarbonCalculationResponse() {
    }

    public Double getTotalCarbon() {
        return totalCarbon;
    }

    public void setTotalCarbon(Double totalCarbon) {
        this.totalCarbon = totalCarbon;
    }

    public Double getTransportEmissions() {
        return transportEmissions;
    }

    public void setTransportEmissions(Double transportEmissions) {
        this.transportEmissions = transportEmissions;
    }

    public Double getEnergyEmissions() {
        return energyEmissions;
    }

    public void setEnergyEmissions(Double energyEmissions) {
        this.energyEmissions = energyEmissions;
    }

    public Double getFoodEmissions() {
        return foodEmissions;
    }

    public void setFoodEmissions(Double foodEmissions) {
        this.foodEmissions = foodEmissions;
    }

    public Double getShoppingEmissions() {
        return shoppingEmissions;
    }

    public void setShoppingEmissions(Double shoppingEmissions) {
        this.shoppingEmissions = shoppingEmissions;
    }

    public Double getWasteEmissions() {
        return wasteEmissions;
    }

    public void setWasteEmissions(Double wasteEmissions) {
        this.wasteEmissions = wasteEmissions;
    }

    public Double getTotalEmissions() {
        return totalEmissions;
    }

    public void setTotalEmissions(Double totalEmissions) {
        this.totalEmissions = totalEmissions;
    }

    public Integer getSustainabilityScore() {
        return sustainabilityScore;
    }

    public void setSustainabilityScore(Integer sustainabilityScore) {
        this.sustainabilityScore = sustainabilityScore;
    }

    public String getLargestSource() {
        return largestSource;
    }

    public void setLargestSource(String largestSource) {
        this.largestSource = largestSource;
    }

    public Map<String, Double> getBreakdown() {
        return breakdown;
    }

    public void setBreakdown(Map<String, Double> breakdown) {
        this.breakdown = breakdown;
    }

    public List<Map<String, Object>> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<Map<String, Object>> recommendations) {
        this.recommendations = recommendations;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}

