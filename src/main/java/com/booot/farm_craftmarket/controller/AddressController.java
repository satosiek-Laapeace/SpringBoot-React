package com.booot.farm_craftmarket.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import org.springframework.web.bind.annotation.RestController;

import com.booot.farm_craftmarket.dto.request.AddressRequestDto;
import com.booot.farm_craftmarket.dto.response.AddressResponseDto;
import com.booot.farm_craftmarket.security.CustomUserDetailService.AppUser;
import com.booot.farm_craftmarket.service.AddressService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {
    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<List<AddressResponseDto>> getAll(
            @AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(addressService.getAllAddresses(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressResponseDto> getOne(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long id) {
        return ResponseEntity.ok(addressService.getAddress(user.getId(), id));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<AddressResponseDto>> getNearby(
            @AuthenticationPrincipal AppUser user,
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5") double radiusKm) {
        return ResponseEntity.ok(
                addressService.getNearbyAddresses(user.getId(), latitude, longitude, radiusKm));
    }

    @PostMapping
    public ResponseEntity<AddressResponseDto> create(
            @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody AddressRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.createAddress(user.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponseDto> update(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequestDto request) {
        return ResponseEntity.ok(addressService.updateAddress(user.getId(), id, request));
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<AddressResponseDto> setDefault(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long id) {
        return ResponseEntity.ok(addressService.setDefaultAddress(user.getId(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long id) {
        addressService.deleteAddress(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}