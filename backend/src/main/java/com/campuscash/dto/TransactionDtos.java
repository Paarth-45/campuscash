package com.campuscash.dto;

import com.campuscash.model.PaymentMethod;
import com.campuscash.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TransactionDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TransactionRequest {
        private Long accountId;
        private Long categoryId;

        @NotNull(message = "Transaction type is required (INCOME or EXPENSE)")
        private TransactionType type;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        private BigDecimal amount;

        private String merchant;
        private String description;
        private LocalDate date;
        private PaymentMethod paymentMethod;
        private String receiptUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TransactionResponse {
        private Long id;
        private Long accountId;
        private Long categoryId;
        private String categoryName;
        private String categoryIcon;
        private String categoryColor;
        private TransactionType type;
        private BigDecimal amount;
        private String merchant;
        private String description;
        private LocalDate date;
        private PaymentMethod paymentMethod;
        private String receiptUrl;
        private LocalDateTime createdAt;
    }
}
