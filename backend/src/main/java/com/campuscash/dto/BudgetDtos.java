package com.campuscash.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class BudgetDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BudgetRequest {
        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotNull(message = "Budget amount is required")
        @DecimalMin(value = "1.00", message = "Budget must be at least ₹1")
        private BigDecimal amount;

        @NotBlank(message = "Month-Year is required (YYYY-MM)")
        private String monthYear;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BudgetResponse {
        private Long id;
        private Long categoryId;
        private String categoryName;
        private String categoryIcon;
        private String categoryColor;
        private BigDecimal amount;
        private BigDecimal spent;
        private BigDecimal remaining;
        private double percentageUsed;
        private String status; // ON_TRACK, WARNING, EXCEEDED
        private String monthYear;
    }
}
