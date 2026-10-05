package com.booot.farm_craftmarket.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.booot.farm_craftmarket.dto.response.PlatformSettingsDto;
import com.booot.farm_craftmarket.mapping.IsAdmin;
import com.booot.farm_craftmarket.service.PlatformSettingsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/settings/marketplace")
@RequiredArgsConstructor
public class PlatformSettingsController {

    private final PlatformSettingsService settingsService;

    @GetMapping
    public ResponseEntity<PlatformSettingsDto> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping
    @IsAdmin
    public ResponseEntity<PlatformSettingsDto> updateSettings(
            @RequestBody PlatformSettingsDto settings) {
        return ResponseEntity.ok(settingsService.updateSettings(settings));
    }
}
