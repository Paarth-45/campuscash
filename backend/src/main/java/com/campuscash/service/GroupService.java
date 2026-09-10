package com.campuscash.service;

import com.campuscash.model.Group;
import com.campuscash.model.GroupExpense;
import com.campuscash.repository.GroupExpenseRepository;
import com.campuscash.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupExpenseRepository groupExpenseRepository;

    public List<Group> getUserGroups(Long userId) {
        return groupRepository.findByOwnerId(userId);
    }

    @Transactional
    public Group createGroup(Long userId, String name, String description) {
        Group group = Group.builder()
                .ownerId(userId)
                .name(name)
                .description(description)
                .build();
        return groupRepository.save(group);
    }

    public List<GroupExpense> getGroupExpenses(Long groupId) {
        return groupExpenseRepository.findByGroupIdOrderByDateDescCreatedAtDesc(groupId);
    }

    @Transactional
    public GroupExpense addGroupExpense(Long userId, Long groupId, BigDecimal amount, String description, Integer splitCount, LocalDate date) {
        GroupExpense expense = GroupExpense.builder()
                .groupId(groupId)
                .paidByUserId(userId)
                .amount(amount)
                .description(description)
                .splitCount(splitCount != null && splitCount > 0 ? splitCount : 2)
                .date(date != null ? date : LocalDate.now())
                .build();

        return groupExpenseRepository.save(expense);
    }

    public BigDecimal calculateYouAreOwed(Long userId, Long groupId) {
        List<GroupExpense> expenses = groupExpenseRepository.findByGroupIdOrderByDateDescCreatedAtDesc(groupId);
        BigDecimal totalOwedToYou = BigDecimal.ZERO;

        for (GroupExpense exp : expenses) {
            if (exp.getPaidByUserId().equals(userId)) {
                // Others owe their share: amount - (amount / splitCount)
                BigDecimal perPerson = exp.getAmount().divide(BigDecimal.valueOf(exp.getSplitCount()), 2, RoundingMode.HALF_UP);
                BigDecimal othersShare = exp.getAmount().subtract(perPerson);
                totalOwedToYou = totalOwedToYou.add(othersShare);
            }
        }

        return totalOwedToYou;
    }
}
