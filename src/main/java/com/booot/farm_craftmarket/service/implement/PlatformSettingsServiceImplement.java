package com.booot.farm_craftmarket.service.implement;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.booot.farm_craftmarket.dto.response.PlatformSettingsDto;
import com.booot.farm_craftmarket.entity.PlatformSettingsEntity;
import com.booot.farm_craftmarket.enums.payments.PaymentMethod;
import com.booot.farm_craftmarket.repository.PlatformSettingsRepository;
import com.booot.farm_craftmarket.service.AbaPaywayClient;
import com.booot.farm_craftmarket.service.PlatformSettingsService;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class PlatformSettingsServiceImplement implements PlatformSettingsService {
    private final PlatformSettingsRepository settingsRepository;
    private final AbaPaywayClient abaPaywayClient;

    @Override
    @Transactional
    public PlatformSettingsDto getSettings() {
        return toDto(getOrCreateSettings());
    }


    @Override
    @Transactional
    public PlatformSettingsDto updateSettings(PlatformSettingsDto settings) {
        PlatformSettingsEntity entity = getOrCreateSettings();
        entity.setAbaPaywayPaymentsEnabled(settings.abaPaywayPaymentsEnabled());
        entity.setCardPaymentsEnabled(false);
        entity.setKhqrPaymentsEnabled(false);
        entity.setBankTransferEnabled(false);
        entity.setCashOnDeliveryEnabled(false);
        return toDto(settingsRepository.save(entity));
    }


    @Override
    public void assertPaymentEnabled(PaymentMethod method) {
        if (method != PaymentMethod.ABA_PAYWAY || !abaPaywayClient.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    method == PaymentMethod.ABA_PAYWAY
                            ? "ABA PayWay is not configured. Check the backend merchant credentials, RSA public key, and callback URL."
                            : "Only ABA PayWay payments are supported");
        }
    }

    private PlatformSettingsEntity getOrCreateSettings() {
        return settingsRepository.findById(PlatformSettingsEntity.SETTINGS_ID)
                .orElseGet(() -> settingsRepository.save(new PlatformSettingsEntity()));
    }

    private PlatformSettingsDto toDto(PlatformSettingsEntity entity) {
        return new PlatformSettingsDto(
                false,
                abaPaywayClient.isConfigured(),
                false,
                false,
                false);
    }
}