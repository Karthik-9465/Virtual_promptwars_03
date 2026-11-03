package com.ecocarbon.service;

import com.ecocarbon.dto.CarbonCalculationRequest;
import com.ecocarbon.dto.CarbonCalculationResponse;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

@Component
public class CarbonCalculator {

    // Grid emission factors in kg CO2 per kWh based on general region profiles
    public double getGridFactor(String location) {
        String loc = (location != null ? location : "").toLowerCase().trim();
        if (loc.contains("china") || loc.equals("cn")) return 0.61;
        if (loc.contains("india") || loc.equals("in")) return 0.82;
        if (loc.contains("usa") || loc.equals("us") || loc.contains("america")) return 0.38;
        if (loc.contains("europe") || loc.equals("eu") || loc.equals("uk") ||
                loc.contains("germany") || loc.contains("france")) return 0.25;
        return 0.50; // Global default factor
    }

    public CarbonCalculationResponse calculate(CarbonCalculationRequest req) {
        String location = req.getLocation() != null ? req.getLocation() : "India";
        String transportMode = req.getTransportMode() != null ? req.getTransportMode() : "public";
        double weeklyDistanceKm = req.getWeeklyDistanceKm() != null ? req.getWeeklyDistanceKm() : 0.0;
        double flightHoursPerYear = req.getFlightHoursPerYear() != null ? req.getFlightHoursPerYear() : 0.0;
        double electricityKwhM = req.getElectricityKwhM() != null ? req.getElectricityKwhM() : 0.0;
        double acHoursPerDay = req.getAcHoursPerDay() != null ? req.getAcHoursPerDay() : 0.0;
        String diet = req.getDiet() != null ? req.getDiet() : "low_meat";
        String shoppingFrequency = req.getShoppingFrequency() != null ? req.getShoppingFrequency() : "medium";
        double wasteRecyclingRate = req.getWasteRecyclingRate() != null ? req.getWasteRecyclingRate() : 0.0;

        // 1. Transportation
        double transportFactor = 0.06; // Default to public / bus
        String mode = transportMode.toLowerCase();
        if (mode.contains("car_petrol") || mode.contains("petrol")) {
            transportFactor = 0.18;
        } else if (mode.contains("car_electric") || mode.contains("electric")) {
            transportFactor = 0.05;
        } else if (mode.contains("motorcycle") || mode.contains("bike_motor")) {
            transportFactor = 0.10;
        } else if (mode.contains("walk") || mode.contains("bicycle")) {
            transportFactor = 0.0;
        }

        double rawTransportEmissions = (weeklyDistanceKm * 4.33 * transportFactor) +
                ((flightHoursPerYear / 12.0) * 90.0); // 90 kg CO2 per flight hour

        // 2. Home Energy
        double gridFactor = getGridFactor(location);
        double electricityEmissions = electricityKwhM * gridFactor;
        double acEmissions = acHoursPerDay * 30.0 * 1.5 * gridFactor; // Assumes 1.5kW AC unit
        double rawEnergyEmissions = electricityEmissions + acEmissions;

        // 3. Food
        double dailyFoodFactor = 4.0; // Default to low meat / mixed diet
        String dietLower = diet.toLowerCase();
        if (dietLower.equals("vegan")) {
            dailyFoodFactor = 1.5;
        } else if (dietLower.equals("vegetarian")) {
            dailyFoodFactor = 2.5;
        } else if (dietLower.equals("low_meat")) {
            dailyFoodFactor = 4.0;
        } else if (dietLower.equals("high_meat")) {
            dailyFoodFactor = 7.5;
        }
        double rawFoodEmissions = dailyFoodFactor * 30.0;

        // 4. Shopping
        double rawShoppingEmissions = 50.0;
        String shopLower = shoppingFrequency.toLowerCase();
        if (shopLower.equals("low")) {
            rawShoppingEmissions = 15.0;
        } else if (shopLower.equals("medium")) {
            rawShoppingEmissions = 50.0;
        } else if (shopLower.equals("high")) {
            rawShoppingEmissions = 150.0;
        }

        // 5. Waste (Baseline 15 kg CO2 reduced by up to 60% based on recycling rate)
        double rawWasteEmissions = Math.max(0.0, 15.0 * (1.0 - (0.6 * wasteRecyclingRate)));

        // Round to 2 decimal places
        double tEm = Math.round(rawTransportEmissions * 100.0) / 100.0;
        double eEm = Math.round(rawEnergyEmissions * 100.0) / 100.0;
        double fEm = Math.round(rawFoodEmissions * 100.0) / 100.0;
        double sEm = Math.round(rawShoppingEmissions * 100.0) / 100.0;
        double wEm = Math.round(rawWasteEmissions * 100.0) / 100.0;
        double totalEmissions = Math.round((tEm + eEm + fEm + sEm + wEm) * 100.0) / 100.0;

        // 6. Sustainability Score
        double baseScore = 100.0 - (totalEmissions / 8.0);
        if (dietLower.equals("vegan")) baseScore += 10.0;
        if (dietLower.equals("vegetarian")) baseScore += 5.0;
        if (wasteRecyclingRate > 0.5) baseScore += 5.0;
        if (mode.contains("walk") || mode.contains("bicycle")) baseScore += 5.0;

        int sustainabilityScore = (int) Math.max(10, Math.min(100, Math.round(baseScore)));

        // 7. Breakdown & Largest Source
        Map<String, Double> breakdown = new LinkedHashMap<>();
        breakdown.put("transport", tEm);
        breakdown.put("homeEnergy", eEm);
        breakdown.put("food", fEm);
        breakdown.put("shopping", sEm);
        breakdown.put("waste", wEm);

        String largestSource = "transport";
        double maxVal = -1.0;
        for (Map.Entry<String, Double> entry : breakdown.entrySet()) {
            if (entry.getValue() > maxVal) {
                maxVal = entry.getValue();
                largestSource = entry.getKey();
            }
        }

        // 8. Dynamic Recommendations
        List<Map<String, Object>> recommendations = new ArrayList<>();
        if (largestSource.equals("transport") || tEm > 100.0) {
            Map<String, Object> rec = new LinkedHashMap<>();
            rec.put("category", "transport");
            rec.put("title", "Shift commute to low-carbon modes");
            rec.put("description", "Carpooling or adopting public transit can reduce monthly transport emissions by up to 35%.");
            rec.put("estimatedReductionKg", Math.round(tEm * 0.35));
            recommendations.add(rec);
        }
        if (largestSource.equals("homeEnergy") || eEm > 120.0) {
            Map<String, Object> rec = new LinkedHashMap<>();
            rec.put("category", "homeEnergy");
            rec.put("title", "Thermostat & AC efficiency calibration");
            rec.put("description", "Raising AC temperatures to 24°C and using sleep timers cuts AC energy consumption by 20-30%.");
            rec.put("estimatedReductionKg", Math.round(eEm * 0.25));
            recommendations.add(rec);
        }
        if (largestSource.equals("food") || fEm > 100.0) {
            Map<String, Object> rec = new LinkedHashMap<>();
            rec.put("category", "food");
            rec.put("title", "Adopt plant-forward meals");
            rec.put("description", "Switching 2 dinners a week to plant-based or vegetarian saves significant greenhouse emissions.");
            rec.put("estimatedReductionKg", Math.round(fEm * 0.20));
            recommendations.add(rec);
        }
        if (largestSource.equals("shopping") || sEm > 80.0) {
            Map<String, Object> rec = new LinkedHashMap<>();
            rec.put("category", "shopping");
            rec.put("title", "Prioritize circular & durable purchases");
            rec.put("description", "Delaying non-essential electronics and buying durable goods prevents industrial processing emissions.");
            rec.put("estimatedReductionKg", Math.round(sEm * 0.30));
            recommendations.add(rec);
        }
        if (largestSource.equals("waste") || wasteRecyclingRate < 0.5) {
            Map<String, Object> rec = new LinkedHashMap<>();
            rec.put("category", "waste");
            rec.put("title", "Segregate organic & dry waste for recycling");
            rec.put("description", "Composting kitchen scraps and recycling paper/plastics prevents methane emissions in landfills.");
            rec.put("estimatedReductionKg", Math.round(wEm * 0.40));
            recommendations.add(rec);
        }

        CarbonCalculationResponse response = new CarbonCalculationResponse();
        response.setTotalCarbon(totalEmissions);
        response.setTransportEmissions(tEm);
        response.setEnergyEmissions(eEm);
        response.setFoodEmissions(fEm);
        response.setShoppingEmissions(sEm);
        response.setWasteEmissions(wEm);
        response.setTotalEmissions(totalEmissions);
        response.setSustainabilityScore(sustainabilityScore);
        response.setLargestSource(largestSource);
        response.setBreakdown(breakdown);
        response.setRecommendations(recommendations);

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("poweredBy", "Spring Boot Local Carbon Calculator Engine");
        metadata.put("timestamp", Instant.now().toString());
        response.setMetadata(metadata);

        return response;
    }
}
