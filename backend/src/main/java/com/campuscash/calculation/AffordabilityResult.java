package com.campuscash.calculation;

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
public class AffordabilityResult {
    private String itemName;
    private BigDecimal itemPrice;
    private BigDecimal currentBalance;
    private BigDecimal postPurchaseBalance;
    private BigDecimal currentDailySafeToSpend;
    private BigDecimal newDailySafeToSpend;
    private BigDecimal dailySafeToSpendReduction;
    private String verdict; // AFFORDABLE, TIGHT, NOT_RECOMMENDED
    private String summary;
    private List<String> tradeoffs;
    private boolean canAfford;
}
