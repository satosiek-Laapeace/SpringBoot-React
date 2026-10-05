package com.booot.farm_craftmarket.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.booot.farm_craftmarket.security.SecurityLogInterceptor;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityLogWebConfig implements WebMvcConfigurer {

    private final SecurityLogInterceptor securityLogInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(securityLogInterceptor).addPathPatterns("/api/**");
    }
}
