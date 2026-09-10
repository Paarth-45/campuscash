package com.campuscash.service;

import com.campuscash.calculation.BudgetUtilizationResult;
import com.campuscash.calculation.FinancialCalculationService;
import com.campuscash.dto.BudgetDtos;
import com.campuscash.model.Budget;
import com.campuscash.model.Category;
import com.campuscash.repository.BudgetRepository;
import com.campuscash.repository.CategoryRepository;
import com.campuscash.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final FinancialCalculationService calculationService;

    @Transactional
    public BudgetDtos.BudgetResponse setBudget(Long userId, BudgetDtos.BudgetRequest request) {
        Budget budget = budgetRepository.findByUserIdAndCategoryIdAndMonthYear(
                userId, request.getCategoryId(), request.getMonthYear()
        ).orElse(
                Budget.builder()
                        .userId(userId)
                        .categoryId(request.getCategoryId())
                        .monthYear(request.getMonthYear())
                        .build()
        );

        budget.setAmount(request.getAmount());
        budget = budgetRepository.save(budget);

        return mapToResponse(userId, budget);
    }

    public List<BudgetDtos.BudgetResponse> getBudgets(Long userId, String monthYear) {
        if (monthYear == null || monthYear.isBlank()) {
            monthYear = YearMonth.now().toString();
        }

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthYear(userId, monthYear);
        List<BudgetDtos.BudgetResponse> responses = new ArrayList<>();
        for (Budget budget : budgets) {
            responses.add(mapToResponse(userId, budget));
        }
        return responses;
    }

    public List<BudgetUtilizationResult> getBudgetUtilization(Long userId, String monthYear) {
        if (monthYear == null || monthYear.isBlank()) {
            monthYear = YearMonth.now().toString();
        }

        YearMonth ym = YearMonth.parse(monthYear);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthYear(userId, monthYear);
        List<BudgetUtilizationResult> results = new ArrayList<>();

        for (Budget budget : budgets) {
            Category category = categoryRepository.findById(budget.getCategoryId()).orElse(null);
            String categoryName = category != null ? category.getName() : "Unknown";
            String categoryIcon = category != null ? category.getIcon() : "tag";

            BigDecimal spent = transactionRepository.sumExpenseByUserIdAndCategoryAndDateBetween(
                    userId, budget.getCategoryId(), start, end
            );

            results.add(calculationService.evaluateBudget(
                    budget.getCategoryId(), categoryName, categoryIcon, budget.getAmount(), spent
            ));
        }
        return results;
    }

    private BudgetDtos.BudgetResponse mapToResponse(Long userId, Budget budget) {
        Category category = categoryRepository.findById(budget.getCategoryId()).orElse(null);
        String categoryName = category != null ? category.getName() : "Category";
        String categoryIcon = category != null ? category.getIcon() : "tag";
        String categoryColor = category != null ? category.getColor() : "#6366f1";

        YearMonth ym = YearMonth.parse(budget.getMonthYear());
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        BigDecimal spent = transactionRepository.sumExpenseByUserIdAndCategoryAndDateBetween(
                userId, budget.getCategoryId(), start, end
        );

        BudgetUtilizationResult result = calculationService.evaluateBudget(
                budget.getCategoryId(), categoryName, categoryIcon, budget.getAmount(), spent
        );

        return BudgetDtos.BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategoryId())
                .categoryName(categoryName)
                .categoryIcon(categoryIcon)
                .categoryColor(categoryColor)
                .amount(budget.getAmount())
                .spent(spent)
                .remaining(result.getRemainingAmount())
                .percentageUsed(result.getPercentageUsed())
                .status(result.getStatus())
                .monthYear(budget.getMonthYear())
                .build();
    }
}
