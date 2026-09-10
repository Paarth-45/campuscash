package com.campuscash.controller;

import com.campuscash.calculation.BudgetUtilizationResult;
import com.campuscash.common.ApiResponse;
import com.campuscash.config.CustomUserPrincipal;
import com.campuscash.dto.BudgetDtos;
import com.campuscash.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetDtos.BudgetResponse>>> getBudgets(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) String monthYear
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        List<BudgetDtos.BudgetResponse> budgets = budgetService.getBudgets(principal.getId(), monthYear);
        return ResponseEntity.ok(ApiResponse.ok(budgets));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetDtos.BudgetResponse>> setBudget(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody BudgetDtos.BudgetRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        BudgetDtos.BudgetResponse response = budgetService.setBudget(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Budget updated successfully", response));
    }

    @GetMapping("/utilization")
    public ResponseEntity<ApiResponse<List<BudgetUtilizationResult>>> getBudgetUtilization(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) String monthYear
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        List<BudgetUtilizationResult> results = budgetService.getBudgetUtilization(principal.getId(), monthYear);
        return ResponseEntity.ok(ApiResponse.ok(results));
    }
}
