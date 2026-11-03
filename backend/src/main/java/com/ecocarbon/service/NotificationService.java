package com.ecocarbon.service;

import com.ecocarbon.dto.NotificationResponse;
import com.ecocarbon.entity.Notification;
import com.ecocarbon.exception.ResourceNotFoundException;
import com.ecocarbon.repository.NotificationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(Long userId) {
        List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 50));
        return notifs.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponse markAsRead(Long userId, Long notificationId) {
        Notification notif = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notif.setIsRead(true);
        notificationRepository.save(notif);
        return mapToDto(notif);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    @Transactional
    public NotificationResponse deleteNotification(Long userId, Long notificationId) {
        Notification notif = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notificationRepository.delete(notif);
        return mapToDto(notif);
    }

    public NotificationResponse mapToDto(Notification n) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(n.getId());
        dto.setUserId(n.getUser().getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setIsRead(n.getIsRead());
        dto.setCreatedAt(n.getCreatedAt());
        dto.setUpdatedAt(n.getUpdatedAt());
        return dto;
    }
}

