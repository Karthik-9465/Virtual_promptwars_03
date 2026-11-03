package com.ecocarbon;

import com.ecocarbon.dto.GoalRequest;
import com.ecocarbon.dto.GoalResponse;
import com.ecocarbon.entity.Goal;
import com.ecocarbon.entity.User;
import com.ecocarbon.exception.BadRequestException;
import com.ecocarbon.exception.ResourceNotFoundException;
import com.ecocarbon.repository.GoalRepository;
import com.ecocarbon.repository.NotificationRepository;
import com.ecocarbon.repository.UserRepository;
import com.ecocarbon.service.GoalService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private GoalService goalService;

    @Test
    @DisplayName("Test Create Goal Success")
    void testCreateGoalSuccess() {
        User user = new User("goaluser@test.com", "hash", "Goal User", "user");
        user.setId(5L);

        when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        GoalRequest req = new GoalRequest();
        req.setTitle("Reduce commute emissions");
        req.setCategory("transport");
        req.setTargetValue(25.0);
        req.setEndDate(LocalDate.now().plusMonths(1));

        GoalResponse res = goalService.createGoal(5L, req);

        assertNotNull(res);
        assertEquals("Reduce commute emissions", res.getTitle());
        assertEquals(25.0, res.getTargetValue());
        verify(goalRepository, times(1)).save(any(Goal.class));
    }

    @Test
    @DisplayName("Test Create Goal Invalid Input Throws Exception")
    void testCreateGoalInvalidInput() {
        GoalRequest req = new GoalRequest();
        req.setTitle("ab"); // too short
        assertThrows(BadRequestException.class, () -> goalService.createGoal(5L, req));
    }

    @Test
    @DisplayName("Test Delete Goal Success")
    void testDeleteGoalSuccess() {
        User user = new User("goaluser@test.com", "hash", "Goal User", "user");
        user.setId(5L);

        Goal goal = new Goal(user, "Test Goal", "transport", 30.0, LocalDate.now().plusMonths(1));
        goal.setId(99L);

        when(goalRepository.findByIdAndUserId(99L, 5L)).thenReturn(Optional.of(goal));

        GoalResponse deleted = goalService.deleteGoal(5L, 99L);
        assertNotNull(deleted);
        assertEquals("Test Goal", deleted.getTitle());
        verify(goalRepository, times(1)).delete(goal);
    }

    @Test
    @DisplayName("Test Update Non-Existent Goal Throws Exception")
    void testUpdateNonExistentGoal() {
        when(goalRepository.findByIdAndUserId(999L, 5L)).thenReturn(Optional.empty());
        GoalRequest req = new GoalRequest();
        req.setTitle("Updated");
        assertThrows(ResourceNotFoundException.class, () -> goalService.updateGoal(5L, 999L, req));
    }
}

