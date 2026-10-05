package com.booot.farm_craftmarket.dto.response;

import java.time.LocalDateTime;

public record SecurityLogResponseDto(
        Long id,
        String eventType,
        Long actorId,
        String actorUsername,
        String actorRole,
        String httpMethod,
        String requestPath,
        int responseStatus,
        String clientIp,
        String authenticationType,
        LocalDateTime createdAt
) {
}
