package com.campuscash.calculation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class FinancialCalculationServiceTest {

    private FinancialCalculationService calculationService;

    @BeforeEach
    void setUp() {
        calculationService = new FinancialCalculationService();
    }

    @Test
    void testCalculateSafeToSpend_Healthy() {
        // Month with 30 days, current date 10th -> 21 remaining days
        LocalDate date = LocalDate.of(2026, 9, 10);
        BigDecimal currentBalance = BigDecimal.valueOf(5000);
        BigDecimal upcomingCommitted = BigDecimal.valueOf(500);
        BigDecimal remainingSavings = BigDecimal.valueOf(1000);

        SafeToSpendResult result = calculationService.calculateSafeToSpend(
                currentBalance, upcomingCommitted, remainingSavings, date
        );

        assertNotNull(result);
        assertFalse(result.isNegative());
        assertEquals("HEALTHY", result.getStatus());
        assertEquals(21, result.getRemainingDaysInMonth());
        // Net available = 5000 - 1500 = 3500. 3500 / 21 = 166.67
        assertEquals(new BigDecimal("166.67"), result.getDailySafeToSpend());
    }

    @Test
    void testCalculateSafeToSpend_Deficit() {
        LocalDate date = LocalDate.of(2026, 9, 10);
        BigDecimal currentBalance = BigDecimal.valueOf(1000);
        BigDecimal upcomingCommitted = BigDecimal.valueOf(1500); // Exceeds balance!
        BigDecimal remainingSavings = BigDecimal.valueOf(500);

        SafeToSpendResult result = calculationService.calculateSafeToSpend(
                currentBalance, upcomingCommitted, remainingSavings, date
        );

        assertNotNull(result);
        assertTrue(result.isNegative());
        assertEquals("DEFICIT", result.getStatus());
        assertTrue(result.getDailySafeToSpend().compareTo(BigDecimal.ZERO) < 0);
    }

    @Test
    void testBudgetEvaluation_Thresholds() {
        // Normal
        BudgetUtilizationResult normal = calculationService.evaluateBudget(
                1L, "Food", "utensils", BigDecimal.valueOf(2000), BigDecimal.valueOf(1000)
        );
        assertEquals("ON_TRACK", normal.getStatus());
        assertEquals(50.0, normal.getPercentageUsed());

        // Warning (>80%)
        BudgetUtilizationResult warning = calculationService.evaluateBudget(
                1L, "Food", "utensils", BigDecimal.valueOf(2000), BigDecimal.valueOf(1700)
        );
        assertEquals("WARNING", warning.getStatus());
        assertEquals(85.0, warning.getPercentageUsed());

        // Exceeded (>100%)
        BudgetUtilizationResult exceeded = calculationService.evaluateBudget(
                1L, "Food", "utensils", BigDecimal.valueOf(2000), BigDecimal.valueOf(2200)
        );
        assertEquals("EXCEEDED", exceeded.getStatus());
        assertEquals(110.0, exceeded.getPercentageUsed());
    }

    @Test
    void testAffordabilitySimulation() {
        LocalDate date = LocalDate.of(2026, 9, 10);
        BigDecimal balance = BigDecimal.valueOf(6000);
        BigDecimal committed = BigDecimal.valueOf(800);
        BigDecimal savings = BigDecimal.valueOf(1000);

        // Case 1: Affordable item
        AffordabilityResult affordable = calculationService.simulateAffordability(
                "Novel", BigDecimal.valueOf(350), balance, committed, savings, date
        );
        assertTrue(affordable.isCanAfford());
        assertEquals("AFFORDABLE", affordable.getVerdict());

        // Case 2: Excessive item that breaches commitments
        AffordabilityResult unaffordable = calculationService.simulateAffordability(
                "Gaming Console", BigDecimal.valueOf(5500), balance, committed, savings, date
        );
        assertFalse(unaffordable.isCanAfford());
        assertEquals("NOT_RECOMMENDED", unaffordable.getVerdict());
    }
}
