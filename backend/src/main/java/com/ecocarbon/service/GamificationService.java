package com.ecocarbon.service;

import com.ecocarbon.dto.GamificationResponse;
import com.ecocarbon.entity.Achievement;
import com.ecocarbon.entity.ActivityLog;
import com.ecocarbon.entity.Notification;
import com.ecocarbon.entity.UserProfile;
import com.ecocarbon.exception.ResourceNotFoundException;
import com.ecocarbon.repository.AchievementRepository;
import com.ecocarbon.repository.ActivityLogRepository;
import com.ecocarbon.repository.NotificationRepository;
import com.ecocarbon.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class GamificationService {

    private final UserProfileRepository userProfileRepository;
    private final AchievementRepository achievementRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationRepository notificationRepository;

    public GamificationService(UserProfileRepository userProfileRepository,
                               AchievementRepository achievementRepository,
                               ActivityLogRepository activityLogRepository,
                               NotificationRepository notificationRepository) {
        this.userProfileRepository = userProfileRepository;
        this.achievementRepository = achievementRepository;
        this.activityLogRepository = activityLogRepository;
        this.notificationRepository = notificationRepository;
    }

    public int calculateLevel(int xp) {
        // 500 XP required per level. Level 1 starts at 0 XP.
        return 1 + (int) Math.floor(xp / 500.0);
    }

    @Transactional
    public GamificationResponse awardXP(Long userId, int xpAmount, String actionName) {
        // 1. Fetch current profile
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile not found for user: " + userId));

        // 2. Log the activity
        ActivityLog log = new ActivityLog(profile.getUser(), actionName, xpAmount);
        activityLogRepository.save(log);

        // 3. Update XP
        int newXP = profile.getXpPoints() + xpAmount;
        profile.setXpPoints(newXP);
        profile.setLastActiveDate(LocalDateTime.now());

        // 4. Check earned badges
        List<Achievement> currentAchievements = achievementRepository.findByUserIdOrderByEarnedAtDesc(userId);
        Set<String> earnedBadgeNames = new HashSet<>();
        for (Achievement a : currentAchievements) {
            earnedBadgeNames.add(a.getBadgeName());
        }

        List<String> newlyUnlockedBadges = new ArrayList<>();

        if (newXP > 0 && !earnedBadgeNames.contains("Eco Beginner")) {
            newlyUnlockedBadges.add("Eco Beginner");
        }
        if (newXP >= 1000 && !earnedBadgeNames.contains("Green Champion")) {
            newlyUnlockedBadges.add("Green Champion");
        }
        if (newXP >= 3000 && !earnedBadgeNames.contains("Carbon Hero")) {
            newlyUnlockedBadges.add("Carbon Hero");
        }
        if (newXP >= 6000 && !earnedBadgeNames.contains("Planet Protector")) {
            newlyUnlockedBadges.add("Planet Protector");
        }
        if (profile.getSustainabilityScore() >= 80 && !earnedBadgeNames.contains("Sustainability Sage")) {
            newlyUnlockedBadges.add("Sustainability Sage");
        }

        // Save new achievements and notifications
        LocalDateTime now = LocalDateTime.now();
        for (String badgeName : newlyUnlockedBadges) {
            Achievement achievement = new Achievement(profile.getUser(), badgeName, now);
            achievementRepository.save(achievement);

            Notification notification = new Notification(
                    profile.getUser(),
                    "🏆 New Achievement Unlocked!",
                    "Congratulations! You unlocked the \"" + badgeName + "\" badge. Keep up the green work!",
                    "badge"
            );
            notificationRepository.save(notification);
        }

        userProfileRepository.save(profile);

        return new GamificationResponse(
                newXP,
                calculateLevel(newXP),
                profile.getStreakDays(),
                newlyUnlockedBadges
        );
    }

    @Transactional
    public int updateStreak(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(null);
        if (profile == null) return 0;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastActive = profile.getLastActiveDate() != null ? profile.getLastActiveDate() : now.minusDays(2);

        long diffDays = ChronoUnit.DAYS.between(lastActive.toLocalDate(), now.toLocalDate());
        int newStreak = profile.getStreakDays() != null ? profile.getStreakDays() : 0;

        if (diffDays == 1) {
            newStreak += 1;
        } else if (diffDays > 1) {
            newStreak = 1;
        } else if (newStreak == 0) {
            newStreak = 1;
        }

        // Check 7-day Streak Star badge
        if (newStreak >= 7 && !achievementRepository.existsByUserIdAndBadgeName(userId, "Streak Star")) {
            Achievement badge = new Achievement(profile.getUser(), "Streak Star", now);
            achievementRepository.save(badge);

            Notification notification = new Notification(
                    profile.getUser(),
                    "🔥 Streak Star Unlocked!",
                    "You have logged actions for 7 consecutive days! You earned the Streak Star badge.",
                    "badge"
            );
            notificationRepository.save(notification);
        }

        if (newStreak > (profile.getStreakDays() != null ? profile.getStreakDays() : 0)) {
            Notification notification = new Notification(
                    profile.getUser(),
                    "🔥 Streak Updated!",
                    "Your login streak has grown to " + newStreak + " days. Keep it up!",
                    "streak"
            );
            notificationRepository.save(notification);
        }

        profile.setStreakDays(newStreak);
        profile.setLastActiveDate(now);
        userProfileRepository.save(profile);

        return newStreak;
    }
}

