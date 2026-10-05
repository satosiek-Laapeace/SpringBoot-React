package com.booot.farm_craftmarket.controller;
import com.booot.farm_craftmarket.dto.request.NotificationRequestDto;
import com.booot.farm_craftmarket.dto.response.NotificationResponseDto;
import com.booot.farm_craftmarket.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.booot.farm_craftmarket.mapping.IsAdmin;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @IsAdmin
    public ResponseEntity<NotificationResponseDto> create(@Valid @RequestBody NotificationRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Page<NotificationResponseDto>> list(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            Pageable pageable) {
        return ResponseEntity.ok(notificationService.getNotifications(userId, unreadOnly, pageable));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Map<String, Long>> unreadCount(@RequestParam Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @RequestParam Long userId) {
        notificationService.markAsRead(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(@RequestParam Long userId) {
        int updated = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Void> delete(@PathVariable Long id, @RequestParam Long userId) {
        notificationService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}