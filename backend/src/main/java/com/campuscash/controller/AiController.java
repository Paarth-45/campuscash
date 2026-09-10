package com.campuscash.controller;

import com.campuscash.common.ApiResponse;
import com.campuscash.config.CustomUserPrincipal;
import com.campuscash.dto.AiDtos;
import com.campuscash.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/parse-expense")
    public ResponseEntity<ApiResponse<AiDtos.AiParseResponse>> parseExpense(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody AiDtos.AiParseRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        AiDtos.AiParseResponse response = aiService.parseExpenseText(principal.getId(), request.getText());
        return ResponseEntity.ok(ApiResponse.ok("Expense parsed successfully", response));
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiDtos.AiChatResponse>> chat(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody AiDtos.AiChatRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        AiDtos.AiChatResponse response = aiService.chatAssistant(principal.getId(), request.getMessage());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
