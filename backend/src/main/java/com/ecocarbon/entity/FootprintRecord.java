package com.ecocarbon.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "footprint_records", indexes = {
    @Index(name = "idx_footprint_user_month", columnList = "user_id, recorded_month")
})
public class FootprintRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "recorded_month", nullable = false)
    private LocalDate recordedMonth;

    @Column(name = "transport_emissions", nullable = false)
    private Double transportEmissions = 0.0;

    @Column(name = "energy_emissions", nullable = false)
    private Double energyEmissions = 0.0;

    @Column(name = "food_emissions", nullable = false)
    private Double foodEmissions = 0.0;

    @Column(name = "shopping_emissions", nullable = false)
    private Double shoppingEmissions = 0.0;

    @Column(name = "waste_emissions", nullable = false)
    private Double wasteEmissions = 0.0;

    @Column(name = "total_emissions", nullable = false)
    private Double totalEmissions = 0.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public FootprintRecord() {
    }

    public FootprintRecord(User user, LocalDate recordedMonth, Double transportEmissions,
                           Double energyEmissions, Double foodEmissions, Double shoppingEmissions,
                           Double wasteEmissions, Double totalEmissions) {
        this.user = user;
        this.recordedMonth = recordedMonth;
        this.transportEmissions = transportEmissions;
        this.energyEmissions = energyEmissions;
        this.foodEmissions = foodEmissions;
        this.shoppingEmissions = shoppingEmissions;
        this.wasteEmissions = wasteEmissions;
        this.totalEmissions = totalEmissions;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

