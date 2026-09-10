package com.campuscash.service;

import com.campuscash.dto.RecurringDtos;
import com.campuscash.model.Category;
import com.campuscash.model.Frequency;
import com.campuscash.model.RecurringTransaction;
import com.campuscash.model.TransactionType;
import com.campuscash.repository.CategoryRepository;
import com.campuscash.repository.RecurringTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecurringService {

    private final RecurringTransactionRepository recurringRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public RecurringDtos.RecurringResponse createRecurring(Long userId, RecurringDtos.RecurringRequest request) {
        RecurringTransaction recurring = RecurringTransaction.builder()
                .userId(userId)
                .categoryId(request.getCategoryId())
                .type(request.getType() != null ? request.getType() : TransactionType.EXPENSE)
                .amount(request.getAmount())
                .description(request.getDescription())
                .frequency(request.getFrequency() != null ? request.getFrequency() : Frequency.MONTHLY)
                .nextDueDate(request.getNextDueDate())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        recurring = recurringRepository.save(recurring);
        return mapToResponse(recurring);
    }

    public List<RecurringDtos.RecurringResponse> getRecurring(Long userId) {
        return recurringRepository.findByUserIdAndActiveTrue(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteRecurring(Long userId, Long recurringId) {
        RecurringTransaction rec = recurringRepository.findById(recurringId)
                .orElseThrow(() -> new IllegalArgumentException("Recurring transaction not found."));

        if (!rec.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access.");
        }

        recurringRepository.delete(rec);
    }

    /**
     * Sum of all upcoming recurring expense commitments due between today and the end of the current month
     */
    public BigDecimal getUpcomingCommittedExpensesThisMonth(Long userId, LocalDate today) {
        YearMonth ym = YearMonth.from(today);
        LocalDate endOfMonth = ym.atEndOfMonth();

        List<RecurringTransaction> list = recurringRepository.findByUserIdAndActiveTrue(userId);
        BigDecimal totalCommitted = BigDecimal.ZERO;

        for (RecurringTransaction item : list) {
            if (item.getType() == TransactionType.EXPENSE && item.getNextDueDate() != null) {
                // If due on or after today and on or before end of month
                if (!item.getNextDueDate().isBefore(today) && !item.getNextDueDate().isAfter(endOfMonth)) {
                    totalCommitted = totalCommitted.add(item.getAmount());
                }
            }
        }

        return totalCommitted;
    }

    private RecurringDtos.RecurringResponse mapToResponse(RecurringTransaction item) {
        String categoryName = "Subscription";
        String categoryIcon = "repeat";

        if (item.getCategoryId() != null) {
            Category cat = categoryRepository.findById(item.getCategoryId()).orElse(null);
            if (cat != null) {
                categoryName = cat.getName();
                categoryIcon = cat.getIcon();
            }
        }

        long daysUntil = 0;
        if (item.getNextDueDate() != null) {
            daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), item.getNextDueDate());
        }

        return RecurringDtos.RecurringResponse.builder()
                .id(item.getId())
                .categoryId(item.getCategoryId())
                .categoryName(categoryName)
                .categoryIcon(categoryIcon)
                .description(item.getDescription())
                .amount(item.getAmount())
                .type(item.getType())
                .frequency(item.getFrequency())
                .nextDueDate(item.getNextDueDate())
                .active(item.getActive())
                .daysUntilDue(daysUntil)
                .build();
    }
}
