package com.booot.farm_craftmarket.controller.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "TestController", description = "Endpoints to test role-based access")
public class TestController {

    @GetMapping("/user/profile")
    @Operation(summary = "User profile endpoint (accessible by USER and ADMIN)")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to User Profile!",
                "user", authentication.getName(),
                "authorities", authentication.getAuthorities()
        ));
    }

    @GetMapping("/admin/dashboard")
    @Operation(summary = "Admin dashboard endpoint (accessible by ADMIN only)")
    public ResponseEntity<?> getAdminDashboard(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to Admin Dashboard!",
                "user", authentication.getName(),
                "authorities", authentication.getAuthorities()
        ));
    }
}