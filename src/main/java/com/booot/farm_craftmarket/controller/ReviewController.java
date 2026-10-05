package com.booot.farm_craftmarket.controller;

import java.net.URI;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.booot.farm_craftmarket.dto.request.review.ReviewRequestDto;
import com.booot.farm_craftmarket.dto.request.review.ReviewUpdateRequestDto;
import com.booot.farm_craftmarket.dto.response.review.ReviewResponseDto;
import com.booot.farm_craftmarket.dto.response.review.ReviewSummaryResponseDto;
import com.booot.farm_craftmarket.mapping.IsBuyer;
import com.booot.farm_craftmarket.security.CustomUserDetailService.AppUser;
import com.booot.farm_craftmarket.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @IsBuyer
    public ResponseEntity<ReviewResponseDto> create(
            @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody ReviewRequestDto request) {
        ReviewResponseDto created = reviewService.create(user.getId(), request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewResponseDto>> getByProduct(
            @PathVariable Long productId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getByProductId(productId, pageable));
    }

    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<ReviewSummaryResponseDto> getSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getSummary(productId));
    }

    @GetMapping("/me")
    @IsBuyer
    public ResponseEntity<Page<ReviewResponseDto>> getMine(
            @AuthenticationPrincipal AppUser user,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getMine(user.getId(), pageable));
    }

    @PutMapping("/{id}")
    @IsBuyer
    public ResponseEntity<ReviewResponseDto> update(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long id,
            @Valid @RequestBody ReviewUpdateRequestDto request) {
        return ResponseEntity.ok(reviewService.update(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','BUYER')")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AppUser user,
            Authentication authentication,
            @PathVariable Long id) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        reviewService.delete(user.getId(), isAdmin, id);
        return ResponseEntity.noContent().build();
    }
}