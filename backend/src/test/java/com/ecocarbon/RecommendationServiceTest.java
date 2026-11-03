package com.ecocarbon;

import com.ecocarbon.dto.RecommendationResponse;
import com.ecocarbon.entity.FootprintRecord;
import com.ecocarbon.entity.Recommendation;
import com.ecocarbon.entity.User;
import com.ecocarbon.entity.UserProfile;
import com.ecocarbon.repository.*;
import com.ecocarbon.service.GamificationService;
import com.ecocarbon.service.RecommendationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecommendationServiceTest {

    @Mock
    private RecommendationRepository recommendationRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private FootprintRecordRepository footprintRecordRepository;

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private GamificationService gamificationService;

    @InjectMocks
    private RecommendationService recommendationService;

    @Test
    @DisplayName("Test Recommendation Generation and Vegan Filtering")
    void testVeganFiltering() {
        User user = new User("vegan@example.com", "hash", "Vegan User", "user");
        user.setId(100L);

        UserProfile profile = new UserProfile(user);
        profile.setId(200L);
        profile.setDiet("vegan");
        profile.setLocation("Germany");
        profile.setTransportMode("car_petrol");
        profile.setWeeklyDistanceKm(100.0);
        profile.setElectricityKwhM(100.0);

        FootprintRecord footprint = new FootprintRecord(
                user, LocalDate.now(), 100.0, 50.0, 45.0, 50.0, 10.0, 255.0
        );

        when(userProfileRepository.findByUserId(100L)).thenReturn(Optional.of(profile));
        when(footprintRecordRepository.findFirstByUserIdOrderByRecordedMonthDesc(100L)).thenReturn(Optional.of(footprint));
        when(recommendationRepository.findByUserIdAndStatusOrderByImpactScoreDesc(100L, "active"))
                .thenReturn(Collections.emptyList());
        when(recommendationRepository.findByUserIdAndStatusIn(eq(100L), any()))
                .thenReturn(Collections.emptyList());

        recommendationService.generateForUser(100L);

        // Verify that saveAll was called and vegetarian/meatless recommendations were filtered out
        verify(recommendationRepository, atLeastOnce()).saveAll(argThat(iterable -> {
            List<Recommendation> list = (List<Recommendation>) iterable;
            for (Recommendation r : list) {
                if (r.getTitle().toLowerCase().contains("meatless") ||
                        r.getTitle().toLowerCase().contains("vegetarian")) {
                    return false;
                }
            }
            return true;
        }));
    }
}

