package com.ecocarbon.service;

import com.ecocarbon.dto.GoalRequest;
import com.ecocarbon.dto.GoalResponse;
import com.ecocarbon.entity.Goal;
import com.ecocarbon.entity.Notification;
import com.ecocarbon.entity.User;
import com.ecocarbon.exception.BadRequestException;
import com.ecocarbon.exception.ResourceNotFoundException;
import com.ecocarbon.repository.GoalRepository;
import com.ecocarbon.repository.NotificationRepository;
import com.ecocarbon.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public GoalService(GoalRepository goalRepository, UserRepository userRepository, NotificationRepository notificationRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> getGoalsForUser(Long userId) {
        return goalRepository.findByUserIdOrderByStartDateDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public GoalResponse createGoal(Long userId, GoalRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().length() < 3) {
            throw new BadRequestException("Goal title must be at least 3 characters long");
        }
        if (request.getTargetValue() == null || request.getTargetValue() < 0.1) {
            throw new BadRequestException("Target value must be at least 0.1 kg CO₂");
        }
        if (request.getEndDate() == null) {
            throw new BadRequestException("Provide a valid end date");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Goal goal = new Goal(
                user,
                request.getTitle().trim(),
                request.getCategory() != null ? request.getCategory() : "total",
                request.getTargetValue(),
                request.getEndDate()
        );
        goalRepository.save(goal);

        Notification notification = new Notification(
                user,
                "🎯 New Goal Activated",
                "You created a new goal: \"" + goal.getTitle() + "\" to reduce " + goal.getTargetValue() + " kg CO₂. Good luck!",
                "goal"
        );
        notificationRepository.save(notification);

        return mapToDto(goal);
    }

    @Transactional
    public GoalResponse updateGoal(Long userId, Long goalId, GoalRequest request) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (request.getTitle() != null && request.getTitle().trim().length() >= 3) {
            goal.setTitle(request.getTitle().trim());
        }
        if (request.getCategory() != null) {
            goal.setCategory(request.getCategory());
        }
        if (request.getTargetValue() != null && request.getTargetValue() >= 0.1) {
            goal.setTargetValue(request.getTargetValue());
        }
        if (request.getCurrentValue() != null && request.getCurrentValue() >= 0) {
            goal.setCurrentValue(request.getCurrentValue());
        }
        if (request.getEndDate() != null) {
            goal.setEndDate(request.getEndDate());
        }
        if (request.getIsCompleted() != null) {
            goal.setIsCompleted(request.getIsCompleted());
        }

        goalRepository.save(goal);

        Notification notification = new Notification(
                goal.getUser(),
                "📝 Goal Modified",
                "Your goal details for \"" + goal.getTitle() + "\" have been updated successfully.",
                "goal"
        );
        notificationRepository.save(notification);

        return mapToDto(goal);
    }

    @Transactional
    public GoalResponse deleteGoal(Long userId, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        goalRepository.delete(goal);

        Notification notification = new Notification(
                goal.getUser(),
                "🗑️ Goal Cancelled",
                "The goal \"" + goal.getTitle() + "\" has been deleted from your tracker.",
                "goal"
        );
        notificationRepository.save(notification);

        return mapToDto(goal);
    }

    public GoalResponse mapToDto(Goal g) {
        GoalResponse dto = new GoalResponse();
        dto.setId(g.getId());
        dto.setUserId(g.getUser().getId());
        dto.setTitle(g.getTitle());
        dto.setCategory(g.getCategory());
        dto.setTargetValue(g.getTargetValue());
        dto.setCurrentValue(g.getCurrentValue());
        dto.setStartDate(g.getStartDate());
        dto.setEndDate(g.getEndDate());
        dto.setIsCompleted(g.getIsCompleted());
        dto.setCreatedAt(g.getCreatedAt());
        dto.setUpdatedAt(g.getUpdatedAt());
        return dto;
    }
}

