package com.campuscash.dto;

import com.campuscash.calculation.BudgetUtilizationResult;
import com.campuscash.calculation.SafeToSpendResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private String userName;
    private String currency;
    private BigDecimal currentBalance;
    private BigDecimal monthlyIncome;
    private BigDecimal monthExpenses;
    private BigDecimal monthSavings;

    private SafeToSpendResult safeToSpend;

    private List<BudgetUtilizationResult> budgetUtilization;
    private List<GoalDtos.GoalResponse> goals;
    private List<RecurringDtos.RecurringResponse> upcomingRecurring;
    private List<TransactionDtos.TransactionResponse> recentTransactions;

    private String aiInsight;
}
