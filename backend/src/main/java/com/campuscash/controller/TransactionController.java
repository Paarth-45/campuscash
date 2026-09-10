package com.campuscash.controller;

import com.campuscash.common.ApiResponse;
import com.campuscash.config.CustomUserPrincipal;
import com.campuscash.dto.TransactionDtos;
import com.campuscash.model.TransactionType;
import com.campuscash.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionDtos.TransactionResponse>>> getTransactions(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        Page<TransactionDtos.TransactionResponse> transactions =
                transactionService.getTransactions(principal.getId(), type, categoryId, query, page, size);
        return ResponseEntity.ok(ApiResponse.ok(transactions));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionDtos.TransactionResponse>> createTransaction(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody TransactionDtos.TransactionRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        TransactionDtos.TransactionResponse response = transactionService.createTransaction(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Transaction recorded successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        transactionService.deleteTransaction(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Transaction deleted", null));
    }
}
