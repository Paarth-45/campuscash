package com.campuscash.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

public class GoalDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GoalRequest {
        @NotBlank(message = "Goal name is required")
        private String name;

        @NotNull(message = "Target amount is required")
        @DecimalMin(value = "1.00", message = "Target amount must be at least ₹1")
        private BigDecimal targetAmount;

        private BigDecimal currentAmount;
        private LocalDate targetDate;
        private String icon;
        private String note;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GoalContributeRequest {
        @NotNull(message = "Contribution amount is required")
        @DecimalMin(value = "1.00", message = "Contribution must be at least ₹1")
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GoalResponse {
        private Long id;
        private String name;
        private BigDecimal targetAmount;
        private BigDecimal currentAmount;
        private BigDecimal remainingAmount;
        private double progressPercentage;
        private LocalDate targetDate;
        private String icon;
        private String note;
        private BigDecimal suggestedMonthlySavings;
    }
}
