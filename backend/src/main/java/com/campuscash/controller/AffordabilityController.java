package com.campuscash.controller;

import com.campuscash.calculation.AffordabilityResult;
import com.campuscash.common.ApiResponse;
import com.campuscash.config.CustomUserPrincipal;
import com.campuscash.dto.AffordabilityDtos;
import com.campuscash.service.AffordabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/affordability")
@RequiredArgsConstructor
public class AffordabilityController {

    private final AffordabilityService affordabilityService;

    @PostMapping("/check")
    public ResponseEntity<ApiResponse<AffordabilityResult>> checkAffordability(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody AffordabilityDtos.AffordabilityCheckRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        AffordabilityResult result = affordabilityService.checkAffordability(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
