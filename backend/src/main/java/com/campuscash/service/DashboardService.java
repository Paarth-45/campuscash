package com.campuscash.service;

import com.campuscash.calculation.BudgetUtilizationResult;
import com.campuscash.calculation.FinancialCalculationService;
import com.campuscash.calculation.SafeToSpendResult;
import com.campuscash.dto.DashboardResponse;
import com.campuscash.dto.GoalDtos;
import com.campuscash.dto.RecurringDtos;
import com.campuscash.dto.TransactionDtos;
import com.campuscash.model.Account;
import com.campuscash.model.TransactionType;
import com.campuscash.model.User;
import com.campuscash.repository.AccountRepository;
import com.campuscash.repository.TransactionRepository;
import com.campuscash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final FinancialCalculationService calculationService;
    private final BudgetService budgetService;
    private final GoalService goalService;
    private final RecurringService recurringService;
    private final TransactionService transactionService;

    public DashboardResponse getDashboardData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDate today = LocalDate.now();
        YearMonth currentYearMonth = YearMonth.from(today);
        LocalDate startOfMonth = currentYearMonth.atDay(1);
        LocalDate endOfMonth = currentYearMonth.atEndOfMonth();

        // 1. Total balance
        List<Account> accounts = accountRepository.findByUserId(userId);
        BigDecimal currentBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Commitments & Goals
        BigDecimal upcomingCommitted = recurringService.getUpcomingCommittedExpensesThisMonth(userId, today);
        BigDecimal remainingGoals = goalService.getTotalRemainingGoalTarget(userId);

        // 3. Safe-to-Spend
        SafeToSpendResult safeToSpend = calculationService.calculateSafeToSpend(
                currentBalance, upcomingCommitted, remainingGoals, today
        );

        // 4. Month's income & expenses
        BigDecimal monthIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                userId, TransactionType.INCOME, startOfMonth, endOfMonth
        );
        BigDecimal monthExpenses = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                userId, TransactionType.EXPENSE, startOfMonth, endOfMonth
        );

        // 5. Budgets & Goals
        List<BudgetUtilizationResult> budgetUtilization = budgetService.getBudgetUtilization(userId, currentYearMonth.toString());
        List<GoalDtos.GoalResponse> goals = goalService.getGoals(userId);

        BigDecimal monthSavings = goals.stream()
                .map(GoalDtos.GoalResponse::getCurrentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 6. Upcoming recurring & Recent transactions
        List<RecurringDtos.RecurringResponse> recurring = recurringService.getRecurring(userId);
        List<TransactionDtos.TransactionResponse> recentTransactions = transactionService.getRecentTransactions(userId, 6);

        // 7. Dynamic Student AI Insight
        String aiInsight = generateInsight(safeToSpend, budgetUtilization, goals);

        return DashboardResponse.builder()
                .userName(user.getName())
                .currency(user.getCurrency())
                .currentBalance(currentBalance)
                .monthlyIncome(user.getMonthlyIncome())
                .monthExpenses(monthExpenses)
                .monthSavings(monthSavings)
                .safeToSpend(safeToSpend)
                .budgetUtilization(budgetUtilization)
                .goals(goals)
                .upcomingRecurring(recurring)
                .recentTransactions(recentTransactions)
                .aiInsight(aiInsight)
                .build();
    }

    private String generateInsight(
            SafeToSpendResult safeToSpend,
            List<BudgetUtilizationResult> budgets,
            List<GoalDtos.GoalResponse> goals
    ) {
        if (safeToSpend.isNegative()) {
            return "💡 CampusCash Insight: Your commitments currently exceed your wallet balance. Postponing discretionary weekend hangouts can help you stay balanced.";
        }

        for (BudgetUtilizationResult b : budgets) {
            if ("EXCEEDED".equals(b.getStatus())) {
                return String.format("💡 CampusCash Alert: You have exceeded your %s budget. Safe-to-Spend has auto-adjusted to absorb the overrun.", b.getCategoryName());
            } else if ("WARNING".equals(b.getStatus())) {
                return String.format("💡 CampusCash Tip: Your %s spending is at %.0f%% of its monthly limit. Try swapping one outing for campus mess meals.", b.getCategoryName(), b.getPercentageUsed());
            }
        }

        if (safeToSpend.getDailySafeToSpend().compareTo(BigDecimal.valueOf(300)) > 0) {
            return String.format("🎉 You're pacing ahead of schedule! You have ₹%s/day safe allowance. Stashing an extra ₹500 into your savings goal would hit your target weeks early.",
                    safeToSpend.getDailySafeToSpend().setScale(0, RoundingMode.HALF_UP));
        }

        return String.format("✨ Safe pace: Keeping daily discretionary spending under ₹%s will leave you with an emergency buffer at month-end.",
                safeToSpend.getDailySafeToSpend().setScale(0, RoundingMode.HALF_UP));
    }
}
