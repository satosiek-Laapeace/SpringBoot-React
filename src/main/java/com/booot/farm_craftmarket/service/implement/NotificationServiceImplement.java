package com.booot.farm_craftmarket.service.implement;

import com.booot.farm_craftmarket.dto.request.NotificationRequestDto;
import com.booot.farm_craftmarket.dto.response.NotificationResponseDto;
import com.booot.farm_craftmarket.entity.NotificationEntity;
import com.booot.farm_craftmarket.enums.stock.NotificationType;
import com.booot.farm_craftmarket.mapper.NotificationMapper;
import com.booot.farm_craftmarket.repository.NotificationRepository;
import com.booot.farm_craftmarket.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImplement implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional
    public NotificationResponseDto create(NotificationRequestDto request) {
        NotificationEntity saved = notificationRepository.save(notificationMapper.toEntity(request));
        return notificationMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void notifyUser(Long userId, NotificationType type, String title, String message, Long referenceId) {
        NotificationEntity notification = NotificationEntity.builder()
                .buyerId(userId)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    public Page<NotificationResponseDto> getNotifications(Long buyerId, boolean unreadOnly, Pageable pageable) {
        Page<NotificationEntity> page = unreadOnly
                ? notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(buyerId, pageable)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(buyerId, pageable);
        return page.map(notificationMapper::toResponse);
    }

    @Override
    public long getUnreadCount(Long buyerId) {
        return notificationRepository.countByUserIdAndReadFalse(buyerId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long buyerId) {
        NotificationEntity notification = findOwned(notificationId, buyerId);
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        }
    }

    @Override
    @Transactional
    public int markAllAsRead(Long buyerId) {
        return notificationRepository.markAllAsRead(buyerId);
    }

    @Override
    @Transactional
    public void delete(Long notificationId, Long buyerId) {
        notificationRepository.delete(findOwned(notificationId, buyerId));
    }

    private NotificationEntity findOwned(Long notificationId, Long buyerId) {
        return notificationRepository.findById(notificationId)
                .filter(n -> n.getBuyerId().equals(buyerId))
                .orElseThrow(() -> new EntityNotFoundException("Notification not found: " + notificationId));
    }
}
