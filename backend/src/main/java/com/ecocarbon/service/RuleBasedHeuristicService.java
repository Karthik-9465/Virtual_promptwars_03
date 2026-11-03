
package com.ecocarbon.service;

import com.ecocarbon.entity.FootprintRecord;
import com.ecocarbon.entity.UserProfile;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RuleBasedHeuristicService {

    public String generateChatResponse(String message, UserProfile profile, FootprintRecord footprint) {
        String msg = (message != null ? message : "").toLowerCase();

        if (msg.contains("meat") || msg.contains("diet") || msg.contains("food") ||
                msg.contains("vegan") || msg.contains("vegetarian")) {
            return "Eating meat daily contributes significantly to emissions. For example, a high-meat diet produces about **7.5 kg CO₂/day**, whereas a vegetarian diet produces **2.5 kg CO₂/day**, and a vegan diet just **1.5 kg CO₂/day**.\n\n"
                    +
                    "By adopting **Meatless Mondays** (just one vegetarian day per week), you can reduce your personal carbon footprint by approximately **20 kg CO₂ per month** and save money on groceries!";
        }

        if (msg.contains("cycle") || msg.contains("cycling") || msg.contains("scooter") ||
                msg.contains("car") || msg.contains("transport") || msg.contains("bus") || msg.contains("train")) {
            String transportInfo = "";
            if (profile != null) {
                double tEm = footprint != null ? footprint.getTransportEmissions() : 0.0;
                transportInfo = "Currently, you commute using a **" + profile.getTransportMode() + "** traveling **" +
                        profile.getWeeklyDistanceKm() + " km/week**, contributing **" + tEm + " kg CO₂/month**. ";
            }
            return transportInfo
                    + "Cycling is carbon-neutral (0 emissions). In contrast, driving a petrol car emits approximately **0.18 kg CO₂/km**, a motorcycle/scooter emits **0.10 kg CO₂/km**, and public transport only **0.06 kg CO₂/km**.\n\n"
                    +
                    "If you switch from a petrol car to cycling or public transport for just 20 km of commuting per week, you'll reduce emissions by about **10-15 kg CO₂/month**.";
        }

        if (msg.contains("bulb") || msg.contains("led") || msg.contains("electricity") ||
                msg.contains("ac") || msg.contains("energy") || msg.contains("solar")) {
            return "Home Energy is a major emissions category. Standard electricity grids produce about **0.5 kg CO₂ per kWh** consumed.\n\n"
                    +
                    "**Quick Wins for Energy:**\n" +
                    "1. **LED Transition**: Swapping 5 traditional incandescent bulbs for LEDs saves **15 kg CO₂/month** and around ₹250/month in utility bills.\n"
                    +
                    "2. **AC Efficiency**: Setting your AC unit to 24°C rather than 18°C consumes up to 30% less power.\n"
                    +
                    "3. **Solar Power**: Installing residential solar panels is a high-impact action that can reduce up to **220 kg CO₂/month** for a typical household.";
        }

        if (msg.contains("reduce") || msg.contains("how can i") || msg.contains("help") || msg.contains("tip")) {
            if (footprint != null) {
                Map<String, Double> categories = new LinkedHashMap<>();
                categories.put("Transport", footprint.getTransportEmissions());
                categories.put("Home Energy", footprint.getEnergyEmissions());
                categories.put("Food Habits", footprint.getFoodEmissions());
                categories.put("Shopping Habits", footprint.getShoppingEmissions());
                categories.put("Waste Generation", footprint.getWasteEmissions());

                String worstName = "Transport";
                double worstVal = -1.0;
                for (Map.Entry<String, Double> entry : categories.entrySet()) {
                    if (entry.getValue() > worstVal) {
                        worstVal = entry.getValue();
                        worstName = entry.getKey();
                    }
                }

                return "Based on your profile, your highest emission category is **" + worstName + "** (" +
                        Math.round(worstVal) + " kg CO₂/month).\n\n" +
                        "To start reducing your footprint immediately, I recommend:\n" +
                        "1. **Quick Win**: Focus on small energy savings (like LEDs or AC timers).\n" +
                        "2. **Behavioral shift**: Shift one meal a day to plant-based, or replace one car trip with public transport.\n"
                        +
                        "3. **Check your Recommendations tab**: I have prepared tailored actions with specific CO₂ reductions, effort ratings, and cost savings for you!";
            }
            return "Welcome! To start reducing your footprint, complete your Eco Profile first. Standard starting steps include adopting Meatless Mondays, switching to LED lightbulbs, unplugging vampire electronics, and walking or cycling for short commutes under 2 km.";
        }

        return "Hello! I'm EcoBot, your sustainability assistant. I can help you understand the carbon impact of different activities (like diets, driving, home energy, and shopping) and help you implement practical reduction strategies.\n\n"
                +
                "Ask me questions like:\n" +
                "- *\"Is cycling better than using a scooter?\"*\n" +
                "- *\"What is the environmental impact of eating meat daily?\"*\n" +
                "- *\"How can I reduce my household electricity footprint?\"*";
    }

    public String generateProfileInsights(UserProfile profile, FootprintRecord footprint) {
        if (profile == null || footprint == null) {
            return "Let's complete your onboarding questionnaire to calculate your carbon footprint and unlock AI-driven environmental insights!";
        }

        List<Map.Entry<String, Double>> categories = new ArrayList<>();
        categories.add(new AbstractMap.SimpleEntry<>("Transport", footprint.getTransportEmissions()));
        categories.add(new AbstractMap.SimpleEntry<>("Home Energy", footprint.getEnergyEmissions()));
        categories.add(new AbstractMap.SimpleEntry<>("Food Habits", footprint.getFoodEmissions()));
        categories.add(new AbstractMap.SimpleEntry<>("Shopping Habits", footprint.getShoppingEmissions()));
        categories.add(new AbstractMap.SimpleEntry<>("Waste Generation", footprint.getWasteEmissions()));

        categories.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));
        Map.Entry<String, Double> top = categories.get(0);

        String tip;
        if (top.getKey().equals("Transport")) {
            tip = "Consider switching to public transport or carpooling a few times a week, or walking/cycling for trips under 2 km.";
        } else if (top.getKey().equals("Home Energy")) {
            tip = "Replacing incandescent bulbs with LEDs or setting your AC to 24-26°C can reduce your household electricity consumption significantly.";
        } else if (top.getKey().equals("Food Habits")) {
            tip = "Adopting Meatless Mondays or reducing dairy consumption can substantially drop your food emissions.";
        } else if (top.getKey().equals("Shopping Habits")) {
            tip = "Slowing down fast-fashion purchases and opting for refurbished electronics will lower your manufacturing impact.";
        } else {
            tip = "Increasing your waste recycling rate and composting food scraps will divert organic waste from landfills.";
        }

        double total = footprint.getTotalEmissions() > 0 ? footprint.getTotalEmissions() : 1.0;
        long percentage = Math.round((top.getValue() / total) * 100.0);

        return "Your biggest emission source is **" + top.getKey() + "** at **" + Math.round(top.getValue()) +
                " kg CO₂/month** (" + percentage + "% of your total footprint). " + tip +
                " Keep updating your logs to improve your Sustainability Score!";
    }
}
