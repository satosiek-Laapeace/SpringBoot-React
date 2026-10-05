package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.response.SecurityLogResponseDto;
import com.booot.farm_craftmarket.entity.SecurityLogEntity;
import com.booot.farm_craftmarket.repository.SecurityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SecurityLogService {

    private final SecurityLogRepository securityLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(SecurityLogEntity event) {
        securityLogRepository.save(event);
    }

    @Transactional(readOnly = true)
    public Page<SecurityLogResponseDto> getRecent(Pageable pageable) {
        return securityLogRepository.findAll(pageable).map(event -> new SecurityLogResponseDto(
                event.getId(),
                event.getEventType(),
                event.getActorId(),
                event.getActorUsername(),
                event.getActorRole(),
                event.getHttpMethod(),
                event.getRequestPath(),
                event.getResponseStatus(),
                event.getClientIp(),
                event.getAuthenticationType(),
                event.getCreatedAt()
        ));
    }
}
