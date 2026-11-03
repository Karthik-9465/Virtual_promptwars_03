package com.ecocarbon.service;

import com.ecocarbon.entity.ChatMessage;
import com.ecocarbon.entity.FootprintRecord;
import com.ecocarbon.entity.UserProfile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String modelName;

    private final RuleBasedHeuristicService heuristicService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService(RuleBasedHeuristicService heuristicService) {
        this.heuristicService = heuristicService;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, String> generateChatResponse(UserProfile profile, FootprintRecord footprint,
                                                    String userMessage, List<ChatMessage> history) {
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                String promptContext = buildContextInfo(profile, footprint);
                String systemPrompt = "You are \"EcoBot\", a friendly, encouraging, and highly knowledgeable AI Sustainability Assistant.\n" +
                        "Your goal is to help individuals understand, track, and reduce their carbon footprint.\n" +
                        "Be concise, practical, and action-oriented. Avoid overly dry technical jargon.\n" +
                        "Always use local context if available. Refer to user stats (e.g. diet, transport, score) to make your answers personalized.\n" +
                        "Whenever possible, quantify reductions (e.g., \"Switching to X saves Y kg CO2/month\").\n\n" +
                        promptContext;

                List<Map<String, Object>> contents = new ArrayList<>();

                // System instruction / context setup
                contents.add(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", systemPrompt))
                ));
                contents.add(Map.of(
                        "role", "model",
                        "parts", List.of(Map.of("text", "Understood! I am EcoBot, ready to provide personalized, actionable carbon reduction advice." ))
                ));

                // History
                if (history != null) {
                    for (ChatMessage msg : history) {
                        String role = "user".equalsIgnoreCase(msg.getSender()) ? "user" : "model";
                        contents.add(Map.of(
                                "role", role,
                                "parts", List.of(Map.of("text", msg.getText()))
                        ));
                    }
                }

                // New message
                contents.add(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", userMessage))
                ));

                Map<String, Object> requestBody = Map.of("contents", contents);

                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode candidates = root.path("candidates");
                    if (candidates.isArray() && !candidates.isEmpty()) {
                        String text = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                        if (text != null && !text.trim().isEmpty()) {
                            return Map.of("text", text, "source", "gemini");
                        }
                    }
                }
            } catch (Exception e) {
                logger.warn("Gemini API call failed, falling back to rule-based reasoning: {}", e.getMessage());
            }
        }

        // Fallback to heuristic
        String fallback = heuristicService.generateChatResponse(userMessage, profile, footprint);
        return Map.of("text", fallback, "source", "fallback");
    }

    public String generateProfileInsights(UserProfile profile, FootprintRecord footprint) {
        if (apiKey != null && !apiKey.trim().isEmpty() && profile != null && footprint != null) {
            try {
                String prompt = "Analyze the following carbon footprint profile and write a short, punchy 3-sentence summary highlighting the user's largest contributor and a practical tip to reduce it.\n" +
                        "Stats:\n" +
                        "- Total: " + footprint.getTotalEmissions() + " kg CO2/month\n" +
                        "- Transport: " + footprint.getTransportEmissions() + " kg\n" +
                        "- Energy: " + footprint.getEnergyEmissions() + " kg\n" +
                        "- Food: " + footprint.getFoodEmissions() + " kg\n" +
                        "- Shopping: " + footprint.getShoppingEmissions() + " kg\n" +
                        "- Waste: " + footprint.getWasteEmissions() + " kg\n" +
                        "- Diet: " + profile.getDiet() + "\n" +
                        "- Primary Transport: " + profile.getTransportMode();

                Map<String, Object> requestBody = Map.of(
                        "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", prompt))))
                );

                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode candidates = root.path("candidates");
                    if (candidates.isArray() && !candidates.isEmpty()) {
                        String text = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                        if (text != null && !text.trim().isEmpty()) {
                            return text;
                        }
                    }
                }
            } catch (Exception e) {
                logger.warn("Gemini API call for insights failed: {}", e.getMessage());
            }
        }

        return heuristicService.generateProfileInsights(profile, footprint);
    }

    private String buildContextInfo(UserProfile profile, FootprintRecord footprint) {
        if (profile == null || footprint == null) {
            return "No profile details available yet.";
        }
        return "User Eco Profile:\n" +
                "- Location: " + profile.getLocation() + "\n" +
                "- Age Group: " + profile.getAgeGroup() + "\n" +
                "- Diet: " + profile.getDiet() + "\n" +
                "- Core Transport: " + profile.getTransportMode() + " (" + profile.getWeeklyDistanceKm() + " km/week)\n" +
                "- Monthly Carbon Footprint: " + footprint.getTotalEmissions() + " kg CO2\n" +
                "  * Transport: " + footprint.getTransportEmissions() + " kg CO2\n" +
                "  * Energy: " + footprint.getEnergyEmissions() + " kg CO2\n" +
                "  * Food: " + footprint.getFoodEmissions() + " kg CO2\n" +
                "  * Shopping: " + footprint.getShoppingEmissions() + " kg CO2\n" +
                "  * Waste: " + footprint.getWasteEmissions() + " kg CO2\n" +
                "- Sustainability Score: " + profile.getSustainabilityScore() + "/100\n" +
                "- XP: " + profile.getXpPoints() + ", Streak: " + profile.getStreakDays() + " days";
    }
}

