package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.response.PlatformSettingsDto;
import com.booot.farm_craftmarket.enums.payments.PaymentMethod;

public interface PlatformSettingsService {

    PlatformSettingsDto getSettings();

    PlatformSettingsDto updateSettings(PlatformSettingsDto settings);

    void assertPaymentEnabled(PaymentMethod method);

}

