package com.ecocarbon.controller;

import com.ecocarbon.dto.GoalRequest;
import com.ecocarbon.dto.GoalResponse;
import com.ecocarbon.security.UserPrincipal;
import com.ecocarbon.service.GoalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getGoals(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(goalService.getGoalsForUser(user.getId()));
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(@AuthenticationPrincipal UserPrincipal user,
                                                   @RequestBody GoalRequest request) {
        return new ResponseEntity<>(goalService.createGoal(user.getId(), request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> updateGoal(@AuthenticationPrincipal UserPrincipal user,
                                                   @PathVariable Long id,
                                                   @RequestBody GoalRequest request) {
        return ResponseEntity.ok(goalService.updateGoal(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteGoal(@AuthenticationPrincipal UserPrincipal user,
                                                          @PathVariable Long id) {
        GoalResponse goal = goalService.deleteGoal(user.getId(), id);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Goal successfully deleted");
        response.put("goal", goal);
        return ResponseEntity.ok(response);
    }
}

