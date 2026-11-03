package com.ecocarbon.controller;

import com.ecocarbon.dto.NotificationResponse;
import com.ecocarbon.security.UserPrincipal;
import com.ecocarbon.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(notificationService.getNotifications(user.getId()));
    }

    @PutMapping("/mark-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@AuthenticationPrincipal UserPrincipal user) {
        notificationService.markAllAsRead(user.getId());
        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@AuthenticationPrincipal UserPrincipal user,
                                                           @PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(user.getId(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNotification(@AuthenticationPrincipal UserPrincipal user,
                                                                  @PathVariable Long id) {
        NotificationResponse deleted = notificationService.deleteNotification(user.getId(), id);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Notification deleted successfully");
        response.put("notification", deleted);
        return ResponseEntity.ok(response);
    }
}

