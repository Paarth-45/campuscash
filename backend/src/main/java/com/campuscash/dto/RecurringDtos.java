package com.campuscash.dto;

import com.campuscash.model.Frequency;
import com.campuscash.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RecurringDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecurringRequest {
        private Long categoryId;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        private BigDecimal amount;

        private TransactionType type;
        private Frequency frequency;

        @NotNull(message = "Next due date is required")
        private LocalDate nextDueDate;

        private Boolean active;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecurringResponse {
        private Long id;
        private Long categoryId;
        private String categoryName;
        private String categoryIcon;
        private String description;
        private BigDecimal amount;
        private TransactionType type;
        private Frequency frequency;
        private LocalDate nextDueDate;
        private Boolean active;
        private long daysUntilDue;
    }
}
