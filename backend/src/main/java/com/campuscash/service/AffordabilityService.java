package com.campuscash.service;

import com.campuscash.calculation.AffordabilityResult;
import com.campuscash.calculation.FinancialCalculationService;
import com.campuscash.dto.AffordabilityDtos;
import com.campuscash.model.Account;
import com.campuscash.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AffordabilityService {

    private final AccountRepository accountRepository;
    private final RecurringService recurringService;
    private final GoalService goalService;
    private final FinancialCalculationService calculationService;

    public AffordabilityResult checkAffordability(Long userId, AffordabilityDtos.AffordabilityCheckRequest request) {
        LocalDate today = LocalDate.now();

        // 1. Get total liquid balance across user's accounts
        List<Account> accounts = accountRepository.findByUserId(userId);
        BigDecimal currentBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Get upcoming committed recurring bills
        BigDecimal upcomingCommitted = recurringService.getUpcomingCommittedExpensesThisMonth(userId, today);

        // 3. Get remaining savings goals allocation
        BigDecimal remainingGoals = goalService.getTotalRemainingGoalTarget(userId);

        // 4. Run deterministic simulation
        return calculationService.simulateAffordability(
                request.getItemName(),
                request.getItemPrice(),
                currentBalance,
                upcomingCommitted,
                remainingGoals,
                today
        );
    }
}
