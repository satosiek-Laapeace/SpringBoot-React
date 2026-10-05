package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.request.NotificationRequestDto;
import com.booot.farm_craftmarket.dto.response.NotificationResponseDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.booot.farm_craftmarket.enums.stock.NotificationType;

public interface NotificationService {

    NotificationResponseDto create(NotificationRequestDto request);

    void notifyUser(Long userId, NotificationType type, String title, String message, Long referenceId);

    Page<NotificationResponseDto> getNotifications(Long userId, boolean unreadOnly, Pageable pageable);

    long getUnreadCount(Long userId);

    void markAsRead(Long notificationId, Long userId);

    int markAllAsRead(Long userId);

    void delete(Long notificationId, Long userId);
}
