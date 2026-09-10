package com.campuscash.controller;

import com.campuscash.common.ApiResponse;
import com.campuscash.config.CustomUserPrincipal;
import com.campuscash.dto.GoalDtos;
import com.campuscash.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalDtos.GoalResponse>>> getGoals(@AuthenticationPrincipal CustomUserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        List<GoalDtos.GoalResponse> goals = goalService.getGoals(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(goals));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalDtos.GoalResponse>> createGoal(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody GoalDtos.GoalRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        GoalDtos.GoalResponse goal = goalService.createGoal(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Savings goal created", goal));
    }

    @PostMapping("/{id}/contribute")
    public ResponseEntity<ApiResponse<GoalDtos.GoalResponse>> contribute(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody GoalDtos.GoalContributeRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        GoalDtos.GoalResponse goal = goalService.contribute(principal.getId(), id, request.getAmount());
        return ResponseEntity.ok(ApiResponse.ok("Contribution added to goal", goal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        goalService.deleteGoal(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Goal deleted", null));
    }
}
