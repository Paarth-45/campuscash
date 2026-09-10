package com.campuscash.repository;

import com.campuscash.model.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByUserIdAndActiveTrue(Long userId);
    List<RecurringTransaction> findByUserId(Long userId);
}
