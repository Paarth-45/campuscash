package com.campuscash.repository;

import com.campuscash.model.GroupExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupExpenseRepository extends JpaRepository<GroupExpense, Long> {
    List<GroupExpense> findByGroupIdOrderByDateDescCreatedAtDesc(Long groupId);
}
