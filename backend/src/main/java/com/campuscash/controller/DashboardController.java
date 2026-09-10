package com.campuscash.controller;

import com.campuscash.common.ApiResponse;
import com.campuscash.config.CustomUserPrincipal;
import com.campuscash.dto.DashboardResponse;
import com.campuscash.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(@AuthenticationPrincipal CustomUserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        DashboardResponse response = dashboardService.getDashboardData(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
