package com.booot.farm_craftmarket.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.security.KeyPairGenerator;
import java.util.Base64;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.databind.ObjectMapper;

class AbaPaywayClientTest {
    private static final String API_KEY = "sandbox-test-api-key";

    private final AbaPaywayClient client = new AbaPaywayClient(
            "sandbox",
            "merchant-test-id",
            API_KEY,
            "https://api.farmcraft.test",
            "",
            "",
            "",
            "",
            new ObjectMapper());

    @Test
    void paymentLinksAreUnavailableWithoutAnAbaRsaPublicKey() {
        assertFalse(client.isConfigured());
    }

    @Test
    void callbackSignatureMustMatchThePayloadWithoutCountingHashField() throws Exception {
        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("status", "0");
        payload.put("tran_id", "FC202601010101010001");
        payload.put("hash", hmacSha512Base64("0FC202601010101010001"));

        String signature = hmacSha512Base64("0FC202601010101010001");
        assertNotNull(payload.get("hash"));

        client.validateCallbackSignature(payload, null);
        client.validateCallbackSignature(payload, signature);
        assertThrows(ResponseStatusException.class,
                () -> client.validateCallbackSignature(payload, signature + "tampered"));
    }

    @Test
    void acceptsConfiguredPaymentLinkAndCheckEndpoints() throws Exception {
        AbaPaywayClient configuredClient = new AbaPaywayClient(
                "",
                "merchant-live-id",
                API_KEY,
                "",
                "https://checkout.payway.com.kh/api/payment-gateway/v1/payments/check-transaction-2",
                "https://checkout.payway.com.kh/api/merchant-portal/merchant-access/payment-link/create",
                publicKeyPem(),
                "https://api.farmcraft.test/api/payway/callback",
                new ObjectMapper());

        assertTrue(configuredClient.isConfigured());
    }

    private String publicKeyPem() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        byte[] encoded = generator.generateKeyPair().getPublic().getEncoded();
        return "-----BEGIN PUBLIC KEY-----\n"
                + Base64.getMimeEncoder(64, new byte[] {'\n'}).encodeToString(encoded)
                + "\n-----END PUBLIC KEY-----";
    }

    private String hmacSha512Base64(String input) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec(API_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        return Base64.getEncoder().encodeToString(mac.doFinal(input.getBytes(StandardCharsets.UTF_8)));
    }
}
