package com.campuscash.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class AffordabilityDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AffordabilityCheckRequest {
        @NotBlank(message = "Item name is required")
        private String itemName;

        @NotNull(message = "Item price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        private BigDecimal itemPrice;

        private Long categoryId;
    }
}
