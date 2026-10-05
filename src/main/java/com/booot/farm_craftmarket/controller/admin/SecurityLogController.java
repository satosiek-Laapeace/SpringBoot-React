package com.booot.farm_craftmarket.controller.admin;

import com.booot.farm_craftmarket.dto.response.SecurityLogResponseDto;
import com.booot.farm_craftmarket.service.SecurityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/security-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SecurityLogController {

    private final SecurityLogService securityLogService;

    @GetMapping
    public Page<SecurityLogResponseDto> getRecentLogs(
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        Pageable boundedPageable = PageRequest.of(
                pageable.getPageNumber(),
                Math.min(pageable.getPageSize(), 200),
                pageable.getSort()
        );
        return securityLogService.getRecent(boundedPageable);
    }
}
