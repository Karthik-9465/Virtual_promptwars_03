package com.ecocarbon.service;

import com.ecocarbon.dto.GamificationResponse;
import com.ecocarbon.dto.RecommendationResponse;
import com.ecocarbon.entity.*;
import com.ecocarbon.exception.BadRequestException;
import com.ecocarbon.exception.ResourceNotFoundException;
import com.ecocarbon.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    public static class TemplateRec {
        public final String title;
        public final String description;
        public final String category;
        public final double co2Reduction;
        public final String difficulty;
        public final double estimatedSavings;
        public final String timeRequired;

        public TemplateRec(String title, String description, String category, double co2Reduction,
                           String difficulty, double estimatedSavings, String timeRequired) {
            this.title = title;
            this.description = description;
            this.category = category;
            this.co2Reduction = co2Reduction;
            this.difficulty = difficulty;
            this.estimatedSavings = estimatedSavings;
            this.timeRequired = timeRequired;
        }
    }

    public static final List<TemplateRec> TEMPLATES = List.of(
            // Transport
            new TemplateRec("Walk or cycle for trips under 2 km",
                    "Replace short car or motorcycle trips with walking or cycling to reduce carbon emissions and stay active.",
                    "transport", 12.0, "low", 600.0, "immediate"),
            new TemplateRec("Carpool to work 3 days a week",
                    "Share your daily commute with colleagues or neighbors to divide transport footprint.",
                    "transport", 38.0, "medium", 2500.0, "short_term"),
            new TemplateRec("Switch to public transport 3 days/week",
                    "Use the subway, train, or bus instead of driving to work/study.",
                    "transport", 48.0, "medium", 3000.0, "short_term"),
            new TemplateRec("Switch to an Electric Vehicle (EV)",
                    "If planning a new vehicle purchase, opt for an EV to drastically cut tailpipe emissions.",
                    "transport", 160.0, "high", 7000.0, "long_term"),

            // Energy
            new TemplateRec("Replace 5 incandescent bulbs with LEDs",
                    "Switch energy-guzzling legacy bulbs to energy-efficient LED alternatives.",
                    "energy", 15.0, "low", 250.0, "immediate"),
            new TemplateRec("Turn off AC 1 hour earlier daily",
                    "Set your air conditioner timer or turn it off manually to conserve residential grid energy.",
                    "energy", 12.0, "low", 450.0, "immediate"),
            new TemplateRec("Unplug vampire appliances",
                    "Turn off power strips and chargers at the wall when devices are fully charged or not in use.",
                    "energy", 6.0, "low", 150.0, "immediate"),
            new TemplateRec("Adopt residential solar power",
                    "Install rooftop solar panels to cover your home electricity demands cleanly.",
                    "energy", 220.0, "high", 5000.0, "long_term"),

            // Food
            new TemplateRec("Adopt Meatless Mondays",
                    "Avoid meat eating for just 1 day per week to reduce demand for intensive agricultural farming.",
                    "food", 20.0, "low", 800.0, "immediate"),
            new TemplateRec("Go vegetarian 4 days a week",
                    "Shift your diet to focus primarily on plant-based alternatives and local vegetables.",
                    "food", 65.0, "medium", 2200.0, "short_term"),
            new TemplateRec("Transition to a fully vegan diet",
                    "Eliminate dairy and animal products to lower your personal environmental footprint to the absolute minimum.",
                    "food", 140.0, "high", 4000.0, "long_term"),

            // Shopping
            new TemplateRec("Reduce clothing purchases by 50%",
                    "Combat fast fashion waste by wearing clothes longer and buying high-quality pieces only when needed.",
                    "shopping", 25.0, "medium", 3000.0, "short_term"),
            new TemplateRec("Purchase refurbished electronics",
                    "Extend device lifecycles and reduce e-waste by shopping for certified pre-owned phones and laptops.",
                    "shopping", 80.0, "medium", 12000.0, "long_term"),

            // Waste
            new TemplateRec("Recycle paper, metal, and plastic",
                    "Separate household recyclables from wet waste to divert plastic/glass from municipal landfills.",
                    "waste", 8.0, "low", 100.0, "immediate"),
            new TemplateRec("Start organic kitchen composting",
                    "Turn fruit peels, vegetable scraps, and tea leaves into nutrient-rich soil compost at home.",
                    "waste", 12.0, "medium", 200.0, "short_term")
    );

    private final RecommendationRepository recommendationRepository;
    private final UserProfileRepository userProfileRepository;
    private final FootprintRecordRepository footprintRecordRepository;
    private final GoalRepository goalRepository;
    private final NotificationRepository notificationRepository;
    private final GamificationService gamificationService;

    public RecommendationService(RecommendationRepository recommendationRepository,
                                 UserProfileRepository userProfileRepository,
                                 FootprintRecordRepository footprintRecordRepository,
                                 GoalRepository goalRepository,
                                 NotificationRepository notificationRepository,
                                 GamificationService gamificationService) {
        this.recommendationRepository = recommendationRepository;
        this.userProfileRepository = userProfileRepository;
        this.footprintRecordRepository = footprintRecordRepository;
        this.goalRepository = goalRepository;
        this.notificationRepository = notificationRepository;
        this.gamificationService = gamificationService;
    }

    @Transactional
    public List<RecommendationResponse> generateForUser(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile not found for user: " + userId));

        Optional<FootprintRecord> footprintOpt = footprintRecordRepository.findFirstByUserIdOrderByRecordedMonthDesc(userId);
        if (footprintOpt.isEmpty()) {
            return Collections.emptyList();
        }
        FootprintRecord latestFootprint = footprintOpt.get();

        double total = latestFootprint.getTotalEmissions() != null && latestFootprint.getTotalEmissions() > 0 ?
                latestFootprint.getTotalEmissions() : 1.0;

        Map<String, Double> categoryWeights = new HashMap<>();
        categoryWeights.put("transport", 1.0 + (latestFootprint.getTransportEmissions() / total));
        categoryWeights.put("energy", 1.0 + (latestFootprint.getEnergyEmissions() / total));
        categoryWeights.put("food", 1.0 + (latestFootprint.getFoodEmissions() / total));
        categoryWeights.put("shopping", 1.0 + (latestFootprint.getShoppingEmissions() / total));
        categoryWeights.put("waste", 1.0 + (latestFootprint.getWasteEmissions() / total));

        // Filter templates
        String diet = profile.getDiet() != null ? profile.getDiet().toLowerCase() : "";
        String transportMode = profile.getTransportMode() != null ? profile.getTransportMode().toLowerCase() : "";
        double distance = profile.getWeeklyDistanceKm() != null ? profile.getWeeklyDistanceKm() : 0.0;
        double electricity = profile.getElectricityKwhM() != null ? profile.getElectricityKwhM() : 0.0;
        double ac = profile.getAcHoursPerDay() != null ? profile.getAcHoursPerDay() : 0.0;
        double recycling = profile.getWasteRecyclingRate() != null ? profile.getWasteRecyclingRate() : 0.0;

        List<TemplateRec> filtered = TEMPLATES.stream().filter(rec -> {
            if (rec.category.equals("food")) {
                if (diet.equals("vegan")) return false;
                if (diet.equals("vegetarian") && rec.title.toLowerCase().contains("vegetarian")) return false;
                if (diet.equals("vegetarian") && rec.title.toLowerCase().contains("meatless")) return false;
            }
            if (rec.category.equals("transport")) {
                if (transportMode.equals("walk") && rec.title.toLowerCase().contains("walk")) return false;
                if (distance == 0.0) return false;
            }
            if (rec.category.equals("energy")) {
                if (electricity == 0.0 && rec.title.toLowerCase().contains("electricity")) return false;
                if (ac == 0.0 && rec.title.toLowerCase().contains("ac")) return false;
            }
            if (rec.category.equals("waste")) {
                if (recycling > 0.8 && rec.title.toLowerCase().contains("recycle")) return false;
            }
            return true;
        }).collect(Collectors.toList());

        // Score recommendations
        List<Recommendation> scored = new ArrayList<>();
        for (TemplateRec t : filtered) {
            double feasibility = 1.0;
            if (t.difficulty.equalsIgnoreCase("medium")) feasibility = 0.7;
            if (t.difficulty.equalsIgnoreCase("high")) feasibility = 0.4;

            double weight = categoryWeights.getOrDefault(t.category, 1.0);
            double impact = Math.round(t.co2Reduction * feasibility * weight * 10.0) / 10.0;

            Recommendation rec = new Recommendation(
                    profile.getUser(),
                    t.title,
                    t.description,
                    t.category,
                    t.co2Reduction,
                    t.difficulty,
                    t.estimatedSavings,
                    t.timeRequired,
                    impact,
                    "active"
            );
            scored.add(rec);
        }

        scored.sort((a, b) -> Double.compare(b.getImpactScore(), a.getImpactScore()));

        // Check active / past titles
        List<Recommendation> activeRecs = recommendationRepository.findByUserIdAndStatusOrderByImpactScoreDesc(userId, "active");
        Set<String> activeTitles = activeRecs.stream().map(Recommendation::getTitle).collect(Collectors.toSet());

        List<Recommendation> pastRecs = recommendationRepository.findByUserIdAndStatusIn(userId, List.of("completed", "skipped"));
        Set<String> pastTitles = pastRecs.stream().map(Recommendation::getTitle).collect(Collectors.toSet());

        List<Recommendation> toAdd = scored.stream()
                .filter(r -> !activeTitles.contains(r.getTitle()) && !pastTitles.contains(r.getTitle()))
                .limit(5)
                .collect(Collectors.toList());

        if (toAdd.isEmpty() && activeRecs.size() < 3) {
            List<Recommendation> recyclable = scored.stream()
                    .filter(r -> !activeTitles.contains(r.getTitle()))
                    .limit(5)
                    .collect(Collectors.toList());
            toAdd.addAll(recyclable);
        }

        if (!toAdd.isEmpty()) {
            recommendationRepository.saveAll(toAdd);
        }

        return recommendationRepository.findByUserIdAndStatusOrderByImpactScoreDesc(userId, "active")
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> performAction(Long userId, Long recommendationId, String status) {
        if (!"completed".equalsIgnoreCase(status) && !"skipped".equalsIgnoreCase(status)) {
            throw new BadRequestException("Status must be 'completed' or 'skipped'");
        }

        Recommendation recommendation = recommendationRepository.findByIdAndUserId(recommendationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found"));

        if (!"active".equalsIgnoreCase(recommendation.getStatus())) {
            throw new BadRequestException("Recommendation is already processed");
        }

        recommendation.setStatus(status.toLowerCase());
        recommendationRepository.save(recommendation);

        GamificationResponse gamificationResult = null;

        if ("completed".equalsIgnoreCase(status)) {
            int xpReward = 100;
            if ("medium".equalsIgnoreCase(recommendation.getDifficulty())) xpReward = 250;
            if ("high".equalsIgnoreCase(recommendation.getDifficulty())) xpReward = 500;

            gamificationResult = gamificationService.awardXP(
                    userId,
                    xpReward,
                    "Completed action: " + recommendation.getTitle()
            );

            int streak = gamificationService.updateStreak(userId);
            gamificationResult.setStreakDays(streak);

            Notification notif = new Notification(
                    recommendation.getUser(),
                    "✅ Action Completed!",
                    "Nice job! You completed: \"" + recommendation.getTitle() + "\" and earned +" + xpReward + " XP.",
                    "general"
            );
            notificationRepository.save(notif);

            // Update matching goals
            List<Goal> activeGoals = goalRepository.findByUserIdAndIsCompletedFalse(userId);
            for (Goal goal : activeGoals) {
                if ("total".equalsIgnoreCase(goal.getCategory()) ||
                        goal.getCategory().equalsIgnoreCase(recommendation.getCategory())) {
                    double newCurrent = goal.getCurrentValue() + recommendation.getCo2Reduction();
                    boolean isCompleted = newCurrent >= goal.getTargetValue();

                    goal.setCurrentValue(Math.round(newCurrent * 100.0) / 100.0);
                    goal.setIsCompleted(isCompleted);
                    goalRepository.save(goal);

                    if (isCompleted) {
                        GamificationResponse goalXP = gamificationService.awardXP(
                                userId,
                                300,
                                "Goal Achieved: " + goal.getTitle()
                        );

                        Notification goalNotif = new Notification(
                                recommendation.getUser(),
                                "🎯 Goal Completed!",
                                "Incredible! You completed your target goal \"" + goal.getTitle() + "\" and earned +300 bonus XP.",
                                "goal"
                        );
                        notificationRepository.save(goalNotif);

                        if (gamificationResult != null) {
                            gamificationResult.setXpPoints(goalXP.getXpPoints());
                            gamificationResult.setLevel(goalXP.getLevel());
                            gamificationResult.getNewlyUnlockedBadges().addAll(goalXP.getNewlyUnlockedBadges());
                        }
                    } else {
                        Notification progNotif = new Notification(
                                recommendation.getUser(),
                                "🎯 Goal Progress Updated",
                                "Your goal \"" + goal.getTitle() + "\" is now at " + goal.getCurrentValue() + "/" + goal.getTargetValue() + " kg CO₂. Keep pushing!",
                                "goal"
                        );
                        notificationRepository.save(progNotif);
                    }
                }
            }
        } else {
            Notification notif = new Notification(
                    recommendation.getUser(),
                    "♻️ Recommendation Dismissed",
                    "You dismissed: \"" + recommendation.getTitle() + "\". A new recommendation will take its place.",
                    "general"
            );
            notificationRepository.save(notif);
        }

        // Auto-replenish if active count < 3
        long activeCount = recommendationRepository.countByUserIdAndStatus(userId, "active");
        if (activeCount < 3) {
            generateForUser(userId);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "Action recorded as " + status);
        result.put("recommendation", mapToDto(recommendation));
        result.put("gamification", gamificationResult);
        return result;
    }

    @Transactional
    public List<RecommendationResponse> regenerate(Long userId) {
        recommendationRepository.deleteByUserIdAndStatus(userId, "active");
        List<RecommendationResponse> newRecs = generateForUser(userId);

        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        if (profile != null) {
            Notification notif = new Notification(
                    profile.getUser(),
                    "🔄 Recommendations Regenerated",
                    "Your recommendations list has been refreshed based on your latest profile data.",
                    "general"
            );
            notificationRepository.save(notif);
        }

        return newRecs;
    }

    public RecommendationResponse mapToDto(Recommendation r) {
        RecommendationResponse dto = new RecommendationResponse();
        dto.setId(r.getId());
        dto.setUserId(r.getUser().getId());
        dto.setTitle(r.getTitle());
        dto.setDescription(r.getDescription());
        dto.setCategory(r.getCategory());
        dto.setCo2Reduction(r.getCo2Reduction());
        dto.setDifficulty(r.getDifficulty());
        dto.setEstimatedSavings(r.getEstimatedSavings());
        dto.setTimeRequired(r.getTimeRequired());
        dto.setImpactScore(r.getImpactScore());
        dto.setStatus(r.getStatus());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}

