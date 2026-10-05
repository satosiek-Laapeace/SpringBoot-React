package com.booot.farm_craftmarket.controller.auth;

import com.booot.farm_craftmarket.dto.request.auth.LoginRequestDto;
import com.booot.farm_craftmarket.dto.request.auth.RegisterRequestDto;
import com.booot.farm_craftmarket.dto.response.ApiResponse;
import com.booot.farm_craftmarket.dto.response.auth.LoginResponseDto;
import com.booot.farm_craftmarket.dto.response.auth.MessageResponseDto;
import com.booot.farm_craftmarket.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "AuthController", description = "Login, Registration and Logout APIs")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping({"", "/register"})
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<MessageResponseDto>> register(
            @Valid @RequestBody RegisterRequestDto registerRequestDto) {
        MessageResponseDto registered = userService.registerUser(registerRequestDto);
        return new ResponseEntity<>(
                ApiResponse.success("User registered successfully", registered), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and obtain JWT token")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(
            @Valid @RequestBody LoginRequestDto loginRequestDto,
            HttpServletRequest request) {
        request.setAttribute("auditActorUsername", loginRequestDto.getUsername());
        LoginResponseDto login = userService.login(loginRequestDto);
        return ResponseEntity.ok(ApiResponse.success("User login successful", login));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate the current JWT token",
            security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader) {
        userService.logout(authorizationHeader);
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
}
