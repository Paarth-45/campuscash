package com.campuscash.controller;

import com.campuscash.common.ApiResponse;
import com.campuscash.config.CustomUserPrincipal;
import com.campuscash.model.Group;
import com.campuscash.model.GroupExpense;
import com.campuscash.service.GroupService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Group>>> getGroups(@AuthenticationPrincipal CustomUserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        List<Group> groups = groupService.getUserGroups(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(groups));
    }

    @Data
    public static class CreateGroupRequest {
        private String name;
        private String description;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Group>> createGroup(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody CreateGroupRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        Group group = groupService.createGroup(principal.getId(), request.getName(), request.getDescription());
        return ResponseEntity.ok(ApiResponse.ok("Group created", group));
    }

    @GetMapping("/{id}/expenses")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGroupExpenses(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        List<GroupExpense> expenses = groupService.getGroupExpenses(id);
        BigDecimal owed = groupService.calculateYouAreOwed(principal.getId(), id);

        Map<String, Object> result = new HashMap<>();
        result.put("expenses", expenses);
        result.put("youAreOwed", owed);

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @Data
    public static class AddExpenseRequest {
        private BigDecimal amount;
        private String description;
        private Integer splitCount;
        private LocalDate date;
    }

    @PostMapping("/{id}/expenses")
    public ResponseEntity<ApiResponse<GroupExpense>> addGroupExpense(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody AddExpenseRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        GroupExpense expense = groupService.addGroupExpense(
                principal.getId(), id, request.getAmount(), request.getDescription(), request.getSplitCount(), request.getDate()
        );
        return ResponseEntity.ok(ApiResponse.ok("Group expense recorded", expense));
    }
}
