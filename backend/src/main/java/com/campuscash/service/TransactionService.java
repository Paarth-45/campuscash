package com.campuscash.service;

import com.campuscash.dto.TransactionDtos;
import com.campuscash.model.*;
import com.campuscash.repository.AccountRepository;
import com.campuscash.repository.CategoryRepository;
import com.campuscash.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public TransactionDtos.TransactionResponse createTransaction(Long userId, TransactionDtos.TransactionRequest request) {
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        // Assign default account if not provided
        Long accountId = request.getAccountId();
        if (accountId == null) {
            List<Account> accounts = accountRepository.findByUserId(userId);
            if (!accounts.isEmpty()) {
                accountId = accounts.get(0).getId();
            }
        }

        Transaction transaction = Transaction.builder()
                .userId(userId)
                .accountId(accountId)
                .categoryId(request.getCategoryId())
                .type(request.getType())
                .amount(request.getAmount())
                .merchant(request.getMerchant())
                .description(request.getDescription())
                .date(date)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.UPI)
                .receiptUrl(request.getReceiptUrl())
                .build();

        transaction = transactionRepository.save(transaction);

        // Update account balance
        if (accountId != null) {
            Account account = accountRepository.findById(accountId).orElse(null);
            if (account != null) {
                if (transaction.getType() == TransactionType.INCOME) {
                    account.setBalance(account.getBalance().add(transaction.getAmount()));
                } else {
                    account.setBalance(account.getBalance().subtract(transaction.getAmount()));
                }
                accountRepository.save(account);
            }
        }

        return mapToResponse(transaction);
    }

    public Page<TransactionDtos.TransactionResponse> getTransactions(
            Long userId,
            TransactionType type,
            Long categoryId,
            String query,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> txPage = transactionRepository.searchTransactions(userId, type, categoryId, query, pageable);
        return txPage.map(this::mapToResponse);
    }

    public List<TransactionDtos.TransactionResponse> getRecentTransactions(Long userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<Transaction> page = transactionRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId, pageable);
        return page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found."));

        if (!transaction.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized transaction access.");
        }

        // Revert account balance
        if (transaction.getAccountId() != null) {
            Account account = accountRepository.findById(transaction.getAccountId()).orElse(null);
            if (account != null) {
                if (transaction.getType() == TransactionType.INCOME) {
                    account.setBalance(account.getBalance().subtract(transaction.getAmount()));
                } else {
                    account.setBalance(account.getBalance().add(transaction.getAmount()));
                }
                accountRepository.save(account);
            }
        }

        transactionRepository.delete(transaction);
    }

    public TransactionDtos.TransactionResponse mapToResponse(Transaction transaction) {
        String categoryName = "General";
        String categoryIcon = "circle-dollar-sign";
        String categoryColor = "#94a3b8";

        if (transaction.getCategoryId() != null) {
            Category category = categoryRepository.findById(transaction.getCategoryId()).orElse(null);
            if (category != null) {
                categoryName = category.getName();
                categoryIcon = category.getIcon();
                categoryColor = category.getColor();
            }
        }

        return TransactionDtos.TransactionResponse.builder()
                .id(transaction.getId())
                .accountId(transaction.getAccountId())
                .categoryId(transaction.getCategoryId())
                .categoryName(categoryName)
                .categoryIcon(categoryIcon)
                .categoryColor(categoryColor)
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .merchant(transaction.getMerchant())
                .description(transaction.getDescription())
                .date(transaction.getDate())
                .paymentMethod(transaction.getPaymentMethod())
                .receiptUrl(transaction.getReceiptUrl())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
