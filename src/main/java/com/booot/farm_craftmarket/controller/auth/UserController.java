package com.booot.farm_craftmarket.controller.auth;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.booot.farm_craftmarket.dto.request.auth.UserRequestDto;
import com.booot.farm_craftmarket.dto.response.ApiResponse;
import com.booot.farm_craftmarket.dto.response.auth.UserResponseDto;
import com.booot.farm_craftmarket.enums.roles.RolesUser;
import com.booot.farm_craftmarket.exception.BadRequestException;
import com.booot.farm_craftmarket.mapping.IsAdmin;
import com.booot.farm_craftmarket.mapping.IsAdminOrSelf;
import com.booot.farm_craftmarket.security.CustomUserDetailService.AppUser;
import com.booot.farm_craftmarket.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "User", description = "User Management APIs")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Create a new user (admin only)")
    @PostMapping
    @IsAdmin
    public ResponseEntity<ApiResponse<UserResponseDto>> createUser(
            @Valid @RequestBody UserRequestDto requestDto) {
        return new ResponseEntity<>(
                ApiResponse.success("User created successfully", userService.createUser(requestDto)),
                HttpStatus.CREATED);
    }

    @Operation(summary = "Get my profile")
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponseDto>> getMe(@AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(
                ApiResponse.success("User retrieved successfully", userService.getUserById(user.getId())));
    }

    @Operation(summary = "Upload or replace a user's profile picture")
    @PutMapping(value = "/{id}/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @IsAdminOrSelf
    public ResponseEntity<ApiResponse<UserResponseDto>> updateProfilePicture(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(
                "Profile picture updated successfully", userService.updateProfilePicture(id, file)));
    }

    @Operation(summary = "Get user by ID (admin or the user themselves)")
    @GetMapping("/{id}")
    @IsAdminOrSelf
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("User retrieved successfully", userService.getUserById(id)));
    }

    @Operation(summary = "Get all users (admin only)")
    @GetMapping
    @IsAdmin
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers() {
        return ResponseEntity.ok(
                ApiResponse.success("Users retrieved successfully", userService.getAllUsers()));
    }

    @Operation(summary = "Update user by ID (admin or the user themselves)")
    @PutMapping("/{id}")
    @IsAdminOrSelf
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequestDto requestDto) {
        return ResponseEntity.ok(
                ApiResponse.success("User updated successfully", userService.updateUser(id, requestDto)));
    }

    @Operation(summary = "Change a user's role (admin only)")
    @PatchMapping("/{id}/role")
    @IsAdmin
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUserRole(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUser actor,
            @RequestParam RolesUser role) {
        if (actor.getId().equals(id)) {
            throw new BadRequestException("Administrators cannot change their own role");
        }
        return ResponseEntity.ok(ApiResponse.success(
                "User role updated successfully", userService.updateUserRole(id, role)));
    }

    @Operation(summary = "Enable or disable an account (admin only)")
    @PatchMapping("/{id}/enabled")
    @IsAdmin
    public ResponseEntity<ApiResponse<UserResponseDto>> setUserEnabled(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUser actor,
            @RequestParam boolean enabled) {
        if (actor.getId().equals(id) && !enabled) {
            throw new BadRequestException("Administrators cannot disable their own account");
        }
        return ResponseEntity.ok(ApiResponse.success(
                "User access updated successfully", userService.setUserEnabled(id, enabled)));
    }

    @Operation(summary = "Clear a user's failed-login lock (admin only)")
    @PatchMapping("/{id}/unlock")
    @IsAdmin
    public ResponseEntity<ApiResponse<UserResponseDto>> unlockUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "User login lock cleared successfully", userService.unlockUser(id)));
    }

        @Operation(summary = "Update the authenticated user's profile")
        @PatchMapping("/{id}/profile")
        @IsAdminOrSelf
        public ResponseEntity<ApiResponse<UserResponseDto>> updateProfile(
                @PathVariable Long id,
                @Valid @RequestBody UserRequestDto request) {
            return ResponseEntity.ok(
                    ApiResponse.success("Profile updated successfully", userService.updateProfile(id, request)));
        }

    @Operation(summary = "Delete user by ID (admin only)")
    @DeleteMapping("/{id}")
    @IsAdmin
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}