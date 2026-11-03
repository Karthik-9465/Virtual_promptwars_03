package com.ecocarbon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

public class FootprintRecordDto {
    private Long id;
    private Long userId;
    private LocalDate recordedMonth;
    private Double transportEmissions;
    private Double energyEmissions;
    private Double foodEmissions;
    private Double shoppingEmissions;
    private Double wasteEmissions;
    private Double totalEmissions;

    public FootprintRecordDto() {
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

    public LocalDate getRecordedMonth() {
        return recordedMonth;
    }

    public void setRecordedMonth(LocalDate recordedMonth) {
        this.recordedMonth = recordedMonth;
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
}

