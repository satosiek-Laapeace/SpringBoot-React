package com.booot.farm_craftmarket.configuration;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration("cloudinaryConfiguration")
public class CloudConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;
    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Bean("cloudinaryClient")
    public Cloudinary cloudBinary() {
        Map<String, Object> cloud = new HashMap<>();
        cloud.put("cloud_name", cloudName);
        cloud.put("api_key", apiKey);
        cloud.put("api_secret", apiSecret);

        return new Cloudinary(cloud);
    }
}
