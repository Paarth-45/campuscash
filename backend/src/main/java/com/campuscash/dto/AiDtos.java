package com.campuscash.dto;

import com.campuscash.model.PaymentMethod;
import com.campuscash.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AiDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiParseRequest {
        @NotBlank(message = "Text query is required")
        private String text;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiParseResponse {
        private BigDecimal amount;
        private TransactionType type;
        private String category;
        private Long categoryId;
        private String merchant;
        private String description;
        private PaymentMethod paymentMethod;
        private LocalDate date;
        private double confidence;
        private String explanation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiChatRequest {
        @NotBlank(message = "Prompt message is required")
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiChatResponse {
        private String reply;
        private String actionableTip;
        private String categoryFocus;
    }
}
