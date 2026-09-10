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
public class SafeToSpendResult {
    private BigDecimal dailySafeToSpend;
    private BigDecimal monthlySafeToSpend;
    private BigDecimal currentBalance;
    private BigDecimal upcomingCommittedExpenses;
    private BigDecimal remainingSavingsTarget;
    private int remainingDaysInMonth;
    private boolean isNegative;
    private String status; // HEALTHY, CAUTION, DEFICIT
    private String explanation;
}
