package com.booot.farm_craftmarket.mapper;
import com.booot.farm_craftmarket.dto.request.NotificationRequestDto;
import com.booot.farm_craftmarket.dto.response.NotificationResponseDto;
import com.booot.farm_craftmarket.entity.NotificationEntity;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationEntity toEntity(NotificationRequestDto request) {
        return NotificationEntity.builder()
                .buyerId(request.getBuyerId())
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .referenceId(request.getReferenceId())
                .build();
    }

    public NotificationResponseDto toResponse(NotificationEntity entity) {
        return NotificationResponseDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .read(entity.isRead())
                .referenceId(entity.getReferenceId())
                .createdAt(entity.getCreatedAt())
                .readAt(entity.getReadAt())
                .build();
    }
}