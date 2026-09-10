package com.campuscash.service;

import com.campuscash.dto.GoalDtos;
import com.campuscash.model.Goal;
import com.campuscash.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;

    @Transactional
    public GoalDtos.GoalResponse createGoal(Long userId, GoalDtos.GoalRequest request) {
        Goal goal = Goal.builder()
                .userId(userId)
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .currentAmount(request.getCurrentAmount() != null ? request.getCurrentAmount() : BigDecimal.ZERO)
                .targetDate(request.getTargetDate())
                .icon(request.getIcon() != null ? request.getIcon() : "target")
                .note(request.getNote())
                .build();

        goal = goalRepository.save(goal);
        return mapToResponse(goal);
    }

    public List<GoalDtos.GoalResponse> getGoals(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GoalDtos.GoalResponse contribute(Long userId, Long goalId, BigDecimal amount) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found."));

        if (!goal.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized goal access.");
        }

        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));
        goal = goalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found."));

        if (!goal.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized goal access.");
        }

        goalRepository.delete(goal);
    }

    public BigDecimal getTotalRemainingGoalTarget(Long userId) {
        List<Goal> goals = goalRepository.findByUserIdOrderByCreatedAtDesc(userId);
        BigDecimal totalRemaining = BigDecimal.ZERO;
        for (Goal g : goals) {
            BigDecimal remaining = g.getTargetAmount().subtract(g.getCurrentAmount());
            if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                // If target date is within this month, count the full remaining. Otherwise count monthly pro-rated target.
                long months = 1;
                if (g.getTargetDate() != null) {
                    long m = ChronoUnit.MONTHS.between(LocalDate.now(), g.getTargetDate());
                    if (m > 1) months = m;
                }
                totalRemaining = totalRemaining.add(remaining.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP));
            }
        }
        return totalRemaining;
    }

    private GoalDtos.GoalResponse mapToResponse(Goal goal) {
        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;

        double progress = 0.0;
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progress = goal.getCurrentAmount()
                    .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .doubleValue() * 100.0;
        }

        BigDecimal suggestedMonthly = BigDecimal.ZERO;
        if (goal.getTargetDate() != null && remaining.compareTo(BigDecimal.ZERO) > 0) {
            long months = ChronoUnit.MONTHS.between(LocalDate.now(), goal.getTargetDate());
            if (months <= 0) months = 1;
            suggestedMonthly = remaining.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
        } else if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            suggestedMonthly = remaining;
        }

        return GoalDtos.GoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .remainingAmount(remaining)
                .progressPercentage(Math.min(100.0, Math.round(progress * 10.0) / 10.0))
                .targetDate(goal.getTargetDate())
                .icon(goal.getIcon())
                .note(goal.getNote())
                .suggestedMonthlySavings(suggestedMonthly)
                .build();
    }
}
