package com.campuscash.calculation;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class FinancialCalculationService {

    /**
     * Calculates Safe-to-Spend:
     * (Current Balance - Upcoming Committed Expenses - Remaining Savings Target) / Remaining Days
     */
    public SafeToSpendResult calculateSafeToSpend(
            BigDecimal currentBalance,
            BigDecimal upcomingCommitted,
            BigDecimal remainingSavingsTarget,
            LocalDate currentDate
    ) {
        if (currentBalance == null) currentBalance = BigDecimal.ZERO;
        if (upcomingCommitted == null) upcomingCommitted = BigDecimal.ZERO;
        if (remainingSavingsTarget == null) remainingSavingsTarget = BigDecimal.ZERO;
        if (currentDate == null) currentDate = LocalDate.now();

        YearMonth yearMonth = YearMonth.from(currentDate);
        int totalDaysInMonth = yearMonth.lengthOfMonth();
        // Remaining days includes today
        int remainingDays = Math.max(1, totalDaysInMonth - currentDate.getDayOfMonth() + 1);

        // Safe disposable sum for the remainder of the month
        BigDecimal commitments = upcomingCommitted.add(remainingSavingsTarget);
        BigDecimal netAvailable = currentBalance.subtract(commitments);

        boolean isNegative = netAvailable.compareTo(BigDecimal.ZERO) < 0;

        BigDecimal dailySafeToSpend;
        if (isNegative) {
            // Provide exact daily deficit rate rounded to 2 decimals
            dailySafeToSpend = netAvailable.divide(BigDecimal.valueOf(remainingDays), 2, RoundingMode.HALF_UP);
        } else {
            dailySafeToSpend = netAvailable.divide(BigDecimal.valueOf(remainingDays), 2, RoundingMode.HALF_UP);
        }

        String status;
        String explanation;

        if (isNegative) {
            status = "DEFICIT";
            explanation = String.format(
                    "Committed expenses and savings (₹%s) exceed your current balance (₹%s) by ₹%s. " +
                    "Consider adjusting planned savings or trimming non-essentials to balance the month.",
                    commitments.setScale(0, RoundingMode.HALF_UP),
                    currentBalance.setScale(0, RoundingMode.HALF_UP),
                    commitments.subtract(currentBalance).setScale(0, RoundingMode.HALF_UP)
            );
        } else if (dailySafeToSpend.compareTo(BigDecimal.valueOf(150)) < 0) {
            status = "CAUTION";
            explanation = String.format(
                    "You have ₹%s/day safe to spend for the next %d days after setting aside commitments (₹%s). Spend mindfully.",
                    dailySafeToSpend.setScale(0, RoundingMode.HALF_UP),
                    remainingDays,
                    commitments.setScale(0, RoundingMode.HALF_UP)
            );
        } else {
            status = "HEALTHY";
            explanation = String.format(
                    "Looking solid! You can comfortably spend ₹%s/day for the next %d days while staying on track for bills and savings.",
                    dailySafeToSpend.setScale(0, RoundingMode.HALF_UP),
                    remainingDays
            );
        }

        return SafeToSpendResult.builder()
                .dailySafeToSpend(dailySafeToSpend)
                .monthlySafeToSpend(netAvailable)
                .currentBalance(currentBalance)
                .upcomingCommittedExpenses(upcomingCommitted)
                .remainingSavingsTarget(remainingSavingsTarget)
                .remainingDaysInMonth(remainingDays)
                .isNegative(isNegative)
                .status(status)
                .explanation(explanation)
                .build();
    }

    /**
     * Evaluates budget utilization and alert thresholds
     */
    public BudgetUtilizationResult evaluateBudget(
            Long categoryId,
            String categoryName,
            String categoryIcon,
            BigDecimal budgetLimit,
            BigDecimal currentSpent
    ) {
        if (budgetLimit == null) budgetLimit = BigDecimal.ZERO;
        if (currentSpent == null) currentSpent = BigDecimal.ZERO;

        BigDecimal remaining = budgetLimit.subtract(currentSpent);
        double percentage = 0.0;
        if (budgetLimit.compareTo(BigDecimal.ZERO) > 0) {
            percentage = currentSpent.divide(budgetLimit, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        }

        String status;
        String alertMessage;

        if (percentage >= 100.0) {
            status = "EXCEEDED";
            alertMessage = String.format("%s budget exceeded by ₹%s.", categoryName, currentSpent.subtract(budgetLimit).setScale(0, RoundingMode.HALF_UP));
        } else if (percentage >= 80.0) {
            status = "WARNING";
            alertMessage = String.format("%s budget is at %.0f%% (₹%s left).", categoryName, percentage, remaining.setScale(0, RoundingMode.HALF_UP));
        } else {
            status = "ON_TRACK";
            alertMessage = String.format("%s is on track (₹%s remaining).", categoryName, remaining.setScale(0, RoundingMode.HALF_UP));
        }

        return BudgetUtilizationResult.builder()
                .categoryId(categoryId)
                .categoryName(categoryName)
                .categoryIcon(categoryIcon)
                .budgetLimit(budgetLimit)
                .currentSpent(currentSpent)
                .remainingAmount(remaining)
                .percentageUsed(Math.round(percentage * 10.0) / 10.0)
                .status(status)
                .alertMessage(alertMessage)
                .build();
    }

    /**
     * Deterministic Affordability Simulation ("Can I Afford It?")
     */
    public AffordabilityResult simulateAffordability(
            String itemName,
            BigDecimal itemPrice,
            BigDecimal currentBalance,
            BigDecimal upcomingCommitted,
            BigDecimal remainingSavingsTarget,
            LocalDate currentDate
    ) {
        if (itemPrice == null) itemPrice = BigDecimal.ZERO;
        if (currentBalance == null) currentBalance = BigDecimal.ZERO;
        if (upcomingCommitted == null) upcomingCommitted = BigDecimal.ZERO;
        if (remainingSavingsTarget == null) remainingSavingsTarget = BigDecimal.ZERO;

        SafeToSpendResult currentSafe = calculateSafeToSpend(
                currentBalance, upcomingCommitted, remainingSavingsTarget, currentDate
        );

        BigDecimal postPurchaseBalance = currentBalance.subtract(itemPrice);

        SafeToSpendResult postPurchaseSafe = calculateSafeToSpend(
                postPurchaseBalance, upcomingCommitted, remainingSavingsTarget, currentDate
        );

        BigDecimal dailyReduction = currentSafe.getDailySafeToSpend().subtract(postPurchaseSafe.getDailySafeToSpend());

        List<String> tradeoffs = new ArrayList<>();
        String verdict;
        String summary;
        boolean canAfford;

        tradeoffs.add(String.format("Reduces your daily safe-to-spend by ₹%s/day (from ₹%s to ₹%s).",
                dailyReduction.setScale(0, RoundingMode.HALF_UP),
                currentSafe.getDailySafeToSpend().setScale(0, RoundingMode.HALF_UP),
                postPurchaseSafe.getDailySafeToSpend().setScale(0, RoundingMode.HALF_UP)));

        if (postPurchaseBalance.compareTo(upcomingCommitted) < 0) {
            verdict = "NOT_RECOMMENDED";
            canAfford = false;
            summary = String.format(
                    "Buying this leaves only ₹%s, which isn't enough to cover your ₹%s in committed expenses (rent, bills, subscriptions).",
                    postPurchaseBalance.setScale(0, RoundingMode.HALF_UP),
                    upcomingCommitted.setScale(0, RoundingMode.HALF_UP)
            );
            tradeoffs.add(String.format("Deficit on upcoming bills: ₹%s short.", upcomingCommitted.subtract(postPurchaseBalance).setScale(0, RoundingMode.HALF_UP)));
        } else if (postPurchaseSafe.getDailySafeToSpend().compareTo(BigDecimal.valueOf(100)) < 0) {
            verdict = "TIGHT";
            canAfford = true;
            summary = String.format(
                    "You can technically afford it, but it squeezes your daily allowance down to ₹%s/day for the next %d days.",
                    postPurchaseSafe.getDailySafeToSpend().setScale(0, RoundingMode.HALF_UP),
                    postPurchaseSafe.getRemainingDaysInMonth()
            );
            tradeoffs.add("Daily pocket money drops into tight territory (< ₹100/day).");
            if (remainingSavingsTarget.compareTo(BigDecimal.ZERO) > 0) {
                tradeoffs.add(String.format("May slow down your monthly savings target of ₹%s.", remainingSavingsTarget.setScale(0, RoundingMode.HALF_UP)));
            }
        } else {
            verdict = "AFFORDABLE";
            canAfford = true;
            summary = String.format(
                    "Go for it! Even after spending ₹%s, you still have a comfortable ₹%s/day safe allowance and your bills/savings remain fully covered.",
                    itemPrice.setScale(0, RoundingMode.HALF_UP),
                    postPurchaseSafe.getDailySafeToSpend().setScale(0, RoundingMode.HALF_UP)
            );
            tradeoffs.add("All planned recurring bills and savings targets remain 100% safeguarded.");
        }

        return AffordabilityResult.builder()
                .itemName(itemName)
                .itemPrice(itemPrice)
                .currentBalance(currentBalance)
                .postPurchaseBalance(postPurchaseBalance)
                .currentDailySafeToSpend(currentSafe.getDailySafeToSpend())
                .newDailySafeToSpend(postPurchaseSafe.getDailySafeToSpend())
                .dailySafeToSpendReduction(dailyReduction)
                .verdict(verdict)
                .summary(summary)
                .tradeoffs(tradeoffs)
                .canAfford(canAfford)
                .build();
    }
}
