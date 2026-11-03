package com.ecocarbon.service;

import com.ecocarbon.dto.*;
import com.ecocarbon.entity.*;
import com.ecocarbon.exception.ResourceNotFoundException;
import com.ecocarbon.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final UserProfileRepository userProfileRepository;
    private final FootprintRecordRepository footprintRecordRepository;
    private final AchievementRepository achievementRepository;
    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;
    private final RecommendationRepository recommendationRepository;
    private final NotificationRepository notificationRepository;
    private final GamificationService gamificationService;
    private final GeminiService geminiService;
    private final CarbonCalculationService carbonCalculationService;
    private final RecommendationService recommendationService;
    private final NotificationService notificationService;

    public AnalyticsService(UserProfileRepository userProfileRepository,
                            FootprintRecordRepository footprintRecordRepository,
                            AchievementRepository achievementRepository,
                            GoalRepository goalRepository,
                            ActivityLogRepository activityLogRepository,
                            RecommendationRepository recommendationRepository,
                            NotificationRepository notificationRepository,
                            GamificationService gamificationService,
                            GeminiService geminiService,
                            CarbonCalculationService carbonCalculationService,
                            RecommendationService recommendationService,
                            NotificationService notificationService) {
        this.userProfileRepository = userProfileRepository;
        this.footprintRecordRepository = footprintRecordRepository;
        this.achievementRepository = achievementRepository;
        this.goalRepository = goalRepository;
        this.activityLogRepository = activityLogRepository;
        this.recommendationRepository = recommendationRepository;
        this.notificationRepository = notificationRepository;
        this.gamificationService = gamificationService;
        this.geminiService = geminiService;
        this.carbonCalculationService = carbonCalculationService;
        this.recommendationService = recommendationService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found for id: " + userId));

        // 1. Footprint history (Last 12 records)
        List<FootprintRecord> footprintRecords = footprintRecordRepository.findByUserIdOrderByRecordedMonthAsc(userId);
        List<FootprintRecordDto> footprints = footprintRecords.stream()
                .map(carbonCalculationService::mapToDto)
                .collect(Collectors.toList());

        FootprintRecord latestFootprint = footprintRecords.isEmpty() ? null : footprintRecords.get(footprintRecords.size() - 1);

        // 2. AI insights
        String aiInsights = geminiService.generateProfileInsights(profile, latestFootprint);

        // 3. Badges
        List<Achievement> achievements = achievementRepository.findByUserIdOrderByEarnedAtDesc(userId);
        List<BadgeDto> badges = achievements.stream()
                .map(a -> new BadgeDto(a.getBadgeName(), a.getEarnedAt()))
                .collect(Collectors.toList());

        // 4. Goals summary
        long activeGoals = goalRepository.countByUserIdAndIsCompletedFalse(userId);
        long completedGoals = goalRepository.countByUserIdAndIsCompletedTrue(userId);
        Map<String, Long> goalsSummary = new LinkedHashMap<>();
        goalsSummary.put("active", activeGoals);
        goalsSummary.put("completed", completedGoals);

        // 5. Level calculations
        int currentLevel = gamificationService.calculateLevel(profile.getXpPoints());
        int xpForCurrentLevel = (currentLevel - 1) * 500;
        int xpProgress = profile.getXpPoints() - xpForCurrentLevel;
        int xpNeededForNext = 500;

        Map<String, Object> profileSummary = new LinkedHashMap<>();
        profileSummary.put("location", profile.getLocation());
        profileSummary.put("diet", profile.getDiet());
        profileSummary.put("transportMode", profile.getTransportMode());
        profileSummary.put("sustainabilityScore", profile.getSustainabilityScore());
        profileSummary.put("xpPoints", profile.getXpPoints());
        profileSummary.put("streakDays", profile.getStreakDays());
        profileSummary.put("level", currentLevel);
        profileSummary.put("xpProgress", xpProgress);
        profileSummary.put("xpNeededForNext", xpNeededForNext);

        // 6. Recent activities (top 5)
        List<ActivityLog> activityLogs = activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5));
        List<ActivityLogDto> recentActivities = activityLogs.stream()
                .map(a -> new ActivityLogDto(a.getId(), a.getUser().getId(), a.getActionName(), a.getXpEarned(), a.getCreatedAt()))
                .collect(Collectors.toList());

        // 7. Active recommendations (top 3)
        List<Recommendation> recs = recommendationRepository.findByUserIdAndStatusOrderByImpactScoreDesc(userId, "active");
        List<RecommendationResponse> activeRecommendations = recs.stream()
                .limit(3)
                .map(recommendationService::mapToDto)
                .collect(Collectors.toList());

        // 8. Recent notifications (top 5)
        List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5));
        List<NotificationResponse> recentNotifications = notifs.stream()
                .map(notificationService::mapToDto)
                .collect(Collectors.toList());

        AnalyticsSummaryResponse response = new AnalyticsSummaryResponse();
        response.setProfile(profileSummary);
        response.setFootprints(footprints);
        response.setAiInsights(aiInsights);
        response.setBadges(badges);
        response.setGoalsSummary(goalsSummary);
        response.setRecentActivities(recentActivities);
        response.setActiveRecommendations(activeRecommendations);
        response.setRecentNotifications(recentNotifications);

        return response;
    }
}

