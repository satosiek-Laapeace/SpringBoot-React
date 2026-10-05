package com.booot.farm_craftmarket.service.implement;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.booot.farm_craftmarket.dto.response.PlatformSettingsDto;
import com.booot.farm_craftmarket.entity.PlatformSettingsEntity;
import com.booot.farm_craftmarket.enums.payments.PaymentMethod;
import com.booot.farm_craftmarket.repository.PlatformSettingsRepository;
import com.booot.farm_craftmarket.service.PlatformSettingsService;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class PlatformSettingsServiceImplement implements PlatformSettingsService {
    private final PlatformSettingsRepository settingsRepository;

    @Override
    @Transactional
    public PlatformSettingsDto getSettings() {
        return toDto(getOrCreateSettings());
    }


    @Override
    @Transactional
    public PlatformSettingsDto updateSettings(PlatformSettingsDto settings) {
        PlatformSettingsEntity entity = getOrCreateSettings();
        entity.setCardPaymentsEnabled(settings.cardPaymentsEnabled());
        entity.setKhqrPaymentsEnabled(settings.khqrPaymentsEnabled());
        entity.setBankTransferEnabled(settings.bankTransferEnabled());
        entity.setCashOnDeliveryEnabled(settings.cashOnDeliveryEnabled());
        return toDto(settingsRepository.save(entity));
    }


    @Override
    public void assertPaymentEnabled(PaymentMethod method) {
        PlatformSettingsDto settings = getSettings();
        boolean enabled = switch (method) {
            case CARD -> settings.cardPaymentsEnabled();
            case KHQR_BAKONG -> settings.khqrPaymentsEnabled();
            case BANK_TRANSFER -> settings.bankTransferEnabled();
            case CASH_ON_DELIVERY -> settings.cashOnDeliveryEnabled();
        };

        if (!enabled) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "This payment method is currently unavailable");
        }
    }

    private PlatformSettingsEntity getOrCreateSettings() {
        return settingsRepository.findById(PlatformSettingsEntity.SETTINGS_ID)
                .orElseGet(() -> settingsRepository.save(new PlatformSettingsEntity()));
    }

    private PlatformSettingsDto toDto(PlatformSettingsEntity entity) {
        return new PlatformSettingsDto(
                entity.isCardPaymentsEnabled(),
                entity.isKhqrPaymentsEnabled(),
                entity.isBankTransferEnabled(),
                entity.isCashOnDeliveryEnabled());
    }
}