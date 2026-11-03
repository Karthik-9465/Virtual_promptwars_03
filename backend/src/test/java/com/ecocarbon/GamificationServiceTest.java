package com.ecocarbon;

import com.ecocarbon.dto.GamificationResponse;
import com.ecocarbon.entity.Achievement;
import com.ecocarbon.entity.ActivityLog;
import com.ecocarbon.entity.User;
import com.ecocarbon.entity.UserProfile;
import com.ecocarbon.repository.AchievementRepository;
import com.ecocarbon.repository.ActivityLogRepository;
import com.ecocarbon.repository.NotificationRepository;
import com.ecocarbon.repository.UserProfileRepository;
import com.ecocarbon.service.GamificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GamificationServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private GamificationService gamificationService;

    @Test
    @DisplayName("Test Level Calculation Logic (500 XP per level)")
    void testCalculateLevel() {
        assertEquals(1, gamificationService.calculateLevel(0));
        assertEquals(1, gamificationService.calculateLevel(499));
        assertEquals(2, gamificationService.calculateLevel(500));
        assertEquals(3, gamificationService.calculateLevel(1000));
        assertEquals(7, gamificationService.calculateLevel(3000));
    }

    @Test
    @DisplayName("Test Award XP and Badge Unlocks")
    void testAwardXPAndBadges() {
        User user = new User("test@example.com", "hash", "Test User", "user");
        user.setId(1L);

        UserProfile profile = new UserProfile(user);
        profile.setId(10L);
        profile.setXpPoints(100);
        profile.setSustainabilityScore(85);
        profile.setStreakDays(2);
        profile.setLastActiveDate(LocalDateTime.now());

        when(userProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(achievementRepository.findByUserIdOrderByEarnedAtDesc(1L)).thenReturn(Collections.emptyList());

        GamificationResponse response = gamificationService.awardXP(1L, 1000, "Test Action");

        assertNotNull(response);
        assertEquals(1100, response.getXpPoints());
        assertEquals(3, response.getLevel()); // 1 + floor(1100/500) = 3
        assertTrue(response.getNewlyUnlockedBadges().contains("Eco Beginner"));
        assertTrue(response.getNewlyUnlockedBadges().contains("Green Champion"));
        assertTrue(response.getNewlyUnlockedBadges().contains("Sustainability Sage"));

        verify(activityLogRepository, times(1)).save(any(ActivityLog.class));
        verify(userProfileRepository, times(1)).save(profile);
    }
}

