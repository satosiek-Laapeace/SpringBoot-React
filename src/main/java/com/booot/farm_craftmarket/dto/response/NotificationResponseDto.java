package com.booot.farm_craftmarket.dto.response;

import com.booot.farm_craftmarket.enums.stock.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@Data
@NoArgsConstructor
@Builder
public class NotificationResponseDto {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private Long referenceId;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}