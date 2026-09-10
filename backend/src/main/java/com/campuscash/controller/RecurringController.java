package com.campuscash.controller;

import com.campuscash.common.ApiResponse;
import com.campuscash.config.CustomUserPrincipal;
import com.campuscash.dto.RecurringDtos;
import com.campuscash.service.RecurringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
public class RecurringController {

    private final RecurringService recurringService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecurringDtos.RecurringResponse>>> getRecurring(
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        List<RecurringDtos.RecurringResponse> list = recurringService.getRecurring(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecurringDtos.RecurringResponse>> createRecurring(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody RecurringDtos.RecurringRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        RecurringDtos.RecurringResponse response = recurringService.createRecurring(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Recurring transaction added", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecurring(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        recurringService.deleteRecurring(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Recurring transaction deleted", null));
    }
}
