package com.ecocarbon;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class EcoCarbonIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Health endpoint returns UP")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("connected"));
    }

    @Test
    @DisplayName("Actuator health endpoint returns UP")
    void testActuatorHealthEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @DisplayName("Protected endpoint /api/profile without token returns 401 Unauthorized")
    void testProtectedEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("End-to-end: Register -> Login -> Fetch /api/auth/me -> Calculate Carbon")
    void testRegisterLoginFlow() throws Exception {
        String uniqueEmail = "integration_" + System.currentTimeMillis() + "@test.com";

        // 1. Register
        Map<String, Object> registerPayload = new java.util.HashMap<>();
        registerPayload.put("email", uniqueEmail);
        registerPayload.put("password", "secretPassword123");
        registerPayload.put("name", "Integration Tester");
        registerPayload.put("location", "India");
        registerPayload.put("ageGroup", "professional");
        registerPayload.put("diet", "low_meat");
        registerPayload.put("transportMode", "car_petrol");
        registerPayload.put("weeklyDistanceKm", 50.0);
        registerPayload.put("electricityKwhM", 100.0);
        registerPayload.put("acHoursPerDay", 2.0);
        registerPayload.put("flightHoursPerYear", 0.0);
        registerPayload.put("shoppingFrequency", "medium");
        registerPayload.put("wasteRecyclingRate", 0.5);

        String registerResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerPayload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value(uniqueEmail))
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(registerResponse).get("token").asText();

        // 2. Fetch /api/auth/me using token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(uniqueEmail))
                .andExpect(jsonPath("$.profile").exists());

        // 3. Ad-hoc carbon calculation
        Map<String, Object> calcPayload = Map.of(
                "location", "USA",
                "transportMode", "car_electric",
                "weeklyDistanceKm", 100.0,
                "diet", "vegetarian"
        );

        mockMvc.perform(post("/api/footprint/calculate")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(calcPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEmissions").isNumber())
                .andExpect(jsonPath("$.sustainabilityScore").isNumber());

        // 4. Test Chat endpoint (with heuristic fallback)
        Map<String, Object> chatPayload = Map.of(
                "message", "How can I reduce my home energy emissions?"
        );

        mockMvc.perform(post("/api/chat")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(chatPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userMessage.text").value("How can I reduce my home energy emissions?"))
                .andExpect(jsonPath("$.aiResponse.text").exists());
    }
}
