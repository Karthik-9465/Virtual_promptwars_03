package com.ecocarbon.service;

import com.ecocarbon.dto.CarbonCalculationRequest;
import com.ecocarbon.dto.CarbonCalculationResponse;
import com.ecocarbon.dto.UserProfileDto;
import com.ecocarbon.entity.Notification;
import com.ecocarbon.entity.UserProfile;
import com.ecocarbon.exception.ResourceNotFoundException;
import com.ecocarbon.repository.NotificationRepository;
import com.ecocarbon.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ProfileService {

    private final UserProfileRepository userProfileRepository;
    private final CarbonCalculator carbonCalculator;
    private final CarbonCalculationService carbonCalculationService;
    private final RecommendationService recommendationService;
    private final NotificationRepository notificationRepository;

    public ProfileService(UserProfileRepository userProfileRepository,
                          CarbonCalculator carbonCalculator,
                          CarbonCalculationService carbonCalculationService,
                          RecommendationService recommendationService,
                          NotificationRepository notificationRepository) {
        this.userProfileRepository = userProfileRepository;
        this.carbonCalculator = carbonCalculator;
        this.carbonCalculationService = carbonCalculationService;
        this.recommendationService = recommendationService;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        return mapToDto(profile);
    }

    @Transactional
    public Map<String, Object> updateProfile(Long userId, CarbonCalculationRequest data) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        int prevScore = profile.getSustainabilityScore() != null ? profile.getSustainabilityScore() : 50;

        if (data.getAgeGroup() != null) profile.setAgeGroup(data.getAgeGroup());
        if (data.getLocation() != null) profile.setLocation(data.getLocation());
        if (data.getDiet() != null) profile.setDiet(data.getDiet());
        if (data.getTransportMode() != null) profile.setTransportMode(data.getTransportMode());
        if (data.getWeeklyDistanceKm() != null) profile.setWeeklyDistanceKm(data.getWeeklyDistanceKm());
        if (data.getElectricityKwhM() != null) profile.setElectricityKwhM(data.getElectricityKwhM());
        if (data.getAcHoursPerDay() != null) profile.setAcHoursPerDay(data.getAcHoursPerDay());
        if (data.getFlightHoursPerYear() != null) profile.setFlightHoursPerYear(data.getFlightHoursPerYear());
        if (data.getShoppingFrequency() != null) profile.setShoppingFrequency(data.getShoppingFrequency());
        if (data.getWasteRecyclingRate() != null) profile.setWasteRecyclingRate(data.getWasteRecyclingRate());

        // Recalculate
        CarbonCalculationResponse calcResult = carbonCalculationService.calculateForProfile(profile);
        profile.setSustainabilityScore(calcResult.getSustainabilityScore());
        userProfileRepository.save(profile);

        // Record current month footprint
        carbonCalculationService.recordCurrentMonthFootprint(profile.getUser(), calcResult);

        // Notification alert
        String notifTitle;
        String notifMsg;
        if (calcResult.getSustainabilityScore() > prevScore) {
            notifTitle = "📈 Sustainability Score Improved!";
            notifMsg = "Awesome job! Your eco sustainability index improved from " + prevScore + " to " + calcResult.getSustainabilityScore() + "/100.";
        } else if (calcResult.getSustainabilityScore() < prevScore) {
            notifTitle = "⚠️ Carbon Footprint Increased";
            notifMsg = "Your score dropped from " + prevScore + " to " + calcResult.getSustainabilityScore() + "/100. Review recommended tasks to bring it back up.";
        } else {
            notifTitle = "📝 Habits Profile Synchronized";
            notifMsg = "Your lifestyle inputs have been synchronized. Carbon calculations have been successfully recalculated.";
        }

        Notification notification = new Notification(profile.getUser(), notifTitle, notifMsg, "general");
        notificationRepository.save(notification);

        // Regenerate recommendations
        recommendationService.generateForUser(userId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "Profile and carbon footprint successfully updated");
        result.put("profile", mapToDto(profile));
        result.put("footprint", calcResult);
        return result;
    }

    public UserProfileDto mapToDto(UserProfile p) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(p.getId());
        dto.setUserId(p.getUser().getId());
        dto.setAgeGroup(p.getAgeGroup());
        dto.setLocation(p.getLocation());
        dto.setDiet(p.getDiet());
        dto.setTransportMode(p.getTransportMode());
        dto.setWeeklyDistanceKm(p.getWeeklyDistanceKm());
        dto.setElectricityKwhM(p.getElectricityKwhM());
        dto.setAcHoursPerDay(p.getAcHoursPerDay());
        dto.setFlightHoursPerYear(p.getFlightHoursPerYear());
        dto.setShoppingFrequency(p.getShoppingFrequency());
        dto.setWasteRecyclingRate(p.getWasteRecyclingRate());
        dto.setSustainabilityScore(p.getSustainabilityScore());
        dto.setXpPoints(p.getXpPoints());
        dto.setStreakDays(p.getStreakDays());
        dto.setLastActiveDate(p.getLastActiveDate());
        return dto;
    }
}

