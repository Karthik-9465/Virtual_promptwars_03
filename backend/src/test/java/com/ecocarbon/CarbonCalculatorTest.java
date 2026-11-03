package com.ecocarbon;

import com.ecocarbon.dto.CarbonCalculationRequest;
import com.ecocarbon.dto.CarbonCalculationResponse;
import com.ecocarbon.service.CarbonCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class CarbonCalculatorTest {

    private CarbonCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new CarbonCalculator();
    }

    @Test
    @DisplayName("Test Sustainable Vegan Profile Calculation")
    void testSustainableVeganProfile() {
        CarbonCalculationRequest req = new CarbonCalculationRequest();
        req.setLocation("germany"); // 0.25 grid factor
        req.setDiet("vegan"); // 1.5 * 30 = 45 kg
        req.setTransportMode("walk"); // 0.0 factor
        req.setWeeklyDistanceKm(0.0); // 0
        req.setElectricityKwhM(50.0); // 50 * 0.25 = 12.5 kg
        req.setAcHoursPerDay(0.0);
        req.setFlightHoursPerYear(0.0);
        req.setShoppingFrequency("low"); // 15 kg
        req.setWasteRecyclingRate(0.8); // 15 * (1 - 0.48) = 7.8 kg

        CarbonCalculationResponse res = calculator.calculate(req);

        assertEquals(0.0, res.getTransportEmissions(), 0.01);
        assertEquals(45.0, res.getFoodEmissions(), 0.01);
        assertEquals(12.5, res.getEnergyEmissions(), 0.01);
        assertEquals(15.0, res.getShoppingEmissions(), 0.01);
        assertEquals(7.8, res.getWasteEmissions(), 0.01);
        assertEquals(80.3, res.getTotalEmissions(), 0.01);
        assertTrue(res.getSustainabilityScore() >= 80, "Expected sustainability score >= 80, was: " + res.getSustainabilityScore());
    }

    @Test
    @DisplayName("Test High Emitter Profile Calculation")
    void testHighEmitterProfile() {
        CarbonCalculationRequest req = new CarbonCalculationRequest();
        req.setLocation("india"); // 0.82 grid factor
        req.setDiet("high_meat"); // 7.5 * 30 = 225 kg
        req.setTransportMode("car_petrol"); // 0.18 factor
        req.setWeeklyDistanceKm(200.0); // 200 * 4.33 * 0.18 = 155.88 kg
        req.setElectricityKwhM(200.0); // 200 * 0.82 = 164 kg
        req.setAcHoursPerDay(6.0); // 6 * 30 * 1.5 * 0.82 = 221.4 kg
        req.setFlightHoursPerYear(24.0); // (24/12) * 90 = 180 kg
        req.setShoppingFrequency("high"); // 150 kg
        req.setWasteRecyclingRate(0.1); // 15 * (1 - 0.06) = 14.1 kg

        CarbonCalculationResponse res = calculator.calculate(req);

        assertEquals(225.0, res.getFoodEmissions(), 0.1);
        assertEquals(335.88, res.getTransportEmissions(), 0.5); // 155.88 + 180 = 335.88
        assertEquals(385.4, res.getEnergyEmissions(), 0.5); // 164 + 221.4 = 385.4
        assertEquals(150.0, res.getShoppingEmissions(), 0.1);
        assertEquals(14.1, res.getWasteEmissions(), 0.5);
        assertEquals(1110.38, res.getTotalEmissions(), 1.0);
        assertTrue(res.getSustainabilityScore() < 50, "Expected sustainability score < 50, was: " + res.getSustainabilityScore());
    }

    @Test
    @DisplayName("Test Grid Factors Calculation")
    void testGridFactors() {
        assertEquals(0.82, calculator.getGridFactor("India"));
        assertEquals(0.82, calculator.getGridFactor("IN"));
        assertEquals(0.38, calculator.getGridFactor("USA"));
        assertEquals(0.25, calculator.getGridFactor("Germany"));
        assertEquals(0.25, calculator.getGridFactor("UK"));
        assertEquals(0.61, calculator.getGridFactor("China"));
        assertEquals(0.50, calculator.getGridFactor("Australia")); // fallback default
    }

    @Test
    @DisplayName("Test Waste Recycling Boundaries")
    void testWasteRecyclingBoundaries() {
        CarbonCalculationRequest minRec = new CarbonCalculationRequest();
        minRec.setWasteRecyclingRate(0.0);
        assertEquals(15.0, calculator.calculate(minRec).getWasteEmissions(), 0.01);

        CarbonCalculationRequest maxRec = new CarbonCalculationRequest();
        maxRec.setWasteRecyclingRate(1.0);
        // 15 * (1 - 0.6) = 6.0
        assertEquals(6.0, calculator.calculate(maxRec).getWasteEmissions(), 0.01);
    }
}

