package com.booot.farm_craftmarket.dto.response;

public record PlatformSettingsDto(
        boolean cardPaymentsEnabled,
        boolean abaPaywayPaymentsEnabled,
        boolean khqrPaymentsEnabled,
        boolean bankTransferEnabled,
        boolean cashOnDeliveryEnabled) {
}
