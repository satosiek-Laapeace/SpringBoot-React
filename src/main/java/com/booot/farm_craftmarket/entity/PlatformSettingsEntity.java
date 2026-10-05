package com.booot.farm_craftmarket.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "platform_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettingsEntity {

    public static final long SETTINGS_ID = 1L;

    @Id
    private Long id = SETTINGS_ID;

    @Column(name = "card_payments_enabled", nullable = false)
    private boolean cardPaymentsEnabled = true;

    @Column(name = "khqr_payments_enabled", nullable = false)
    private boolean khqrPaymentsEnabled = true;

    @Column(name = "bank_transfer_enabled", nullable = false)
    private boolean bankTransferEnabled = true;

    @Column(name = "cash_on_delivery_enabled", nullable = false)
    private boolean cashOnDeliveryEnabled = true;
}
