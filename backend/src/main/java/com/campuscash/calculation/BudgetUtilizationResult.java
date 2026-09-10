package com.campuscash.calculation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetUtilizationResult {
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private BigDecimal budgetLimit;
    private BigDecimal currentSpent;
    private BigDecimal remainingAmount;
    private double percentageUsed;
    private String status; // ON_TRACK, WARNING, EXCEEDED
    private String alertMessage;
}
