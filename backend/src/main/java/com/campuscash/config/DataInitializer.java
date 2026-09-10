package com.campuscash.config;

import com.campuscash.dto.AuthDtos;
import com.campuscash.dto.BudgetDtos;
import com.campuscash.dto.GoalDtos;
import com.campuscash.dto.RecurringDtos;
import com.campuscash.dto.TransactionDtos;
import com.campuscash.model.*;
import com.campuscash.repository.*;
import com.campuscash.service.AuthService;
import com.campuscash.service.BudgetService;
import com.campuscash.service.GoalService;
import com.campuscash.service.RecurringService;
import com.campuscash.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final TransactionService transactionService;
    private final BudgetService budgetService;
    private final GoalService goalService;
    private final RecurringService recurringService;

    @Value("${app.seed-demo-data:true}")
    private boolean seedDemoData;

    @Override
    public void run(String... args) {
        seedCategories();
        if (seedDemoData) {
            seedDemoStudent();
        }
    }

    private void seedCategories() {
        if (categoryRepository.findByUserIdIsNull().isEmpty()) {
            log.info("Seeding student-centric default categories...");
            List<Category> defaultCategories = Arrays.asList(
                    Category.builder().name("Food & Canteen").icon("Utensils").color("#f97316").type(TransactionType.EXPENSE).build(),
                    Category.builder().name("Academics & Books").icon("BookOpen").color("#3b82f6").type(TransactionType.EXPENSE).build(),
                    Category.builder().name("Hostel & Rent").icon("Home").color("#8b5cf6").type(TransactionType.EXPENSE).build(),
                    Category.builder().name("Commute & Transit").icon("Bus").color("#eab308").type(TransactionType.EXPENSE).build(),
                    Category.builder().name("Hangouts & Fun").icon("PartyPopper").color("#ec4899").type(TransactionType.EXPENSE).build(),
                    Category.builder().name("Subscriptions & Bills").icon("Repeat").color("#06b6d4").type(TransactionType.EXPENSE).build(),
                    Category.builder().name("Healthcare & Fitness").icon("HeartPulse").color("#ef4444").type(TransactionType.EXPENSE).build(),
                    Category.builder().name("Pocket Money / Allowance").icon("Wallet").color("#10b981").type(TransactionType.INCOME).build(),
                    Category.builder().name("Freelance / Stipend").icon("Laptop").color("#14b8a6").type(TransactionType.INCOME).build()
            );
            categoryRepository.saveAll(defaultCategories);
        }
    }

    private void seedDemoStudent() {
        String demoEmail = "student@campus.edu";
        if (!userRepository.existsByEmail(demoEmail)) {
            log.info("Seeding demo student account: {}", demoEmail);

            AuthDtos.RegisterRequest reg = AuthDtos.RegisterRequest.builder()
                    .name("Aarav Sharma")
                    .email(demoEmail)
                    .password("password123")
                    .monthlyIncome(BigDecimal.valueOf(8000))
                    .currency("INR")
                    .build();

            AuthDtos.AuthResponse auth = authService.register(reg);
            Long userId = auth.getUserId();

            List<Category> categories = categoryRepository.findAllAvailableForUser(userId);
            Category foodCat = findCategory(categories, "Food & Canteen");
            Category booksCat = findCategory(categories, "Academics & Books");
            Category commuteCat = findCategory(categories, "Commute & Transit");
            Category funCat = findCategory(categories, "Hangouts & Fun");
            Category subCat = findCategory(categories, "Subscriptions & Bills");
            Category pocketMoneyCat = findCategory(categories, "Pocket Money / Allowance");

            LocalDate today = LocalDate.now();
            String currentYm = YearMonth.from(today).toString();

            // 1. Initial Income Transaction
            transactionService.createTransaction(userId, TransactionDtos.TransactionRequest.builder()
                    .type(TransactionType.INCOME)
                    .amount(BigDecimal.valueOf(8000))
                    .categoryId(pocketMoneyCat != null ? pocketMoneyCat.getId() : null)
                    .merchant("Parents")
                    .description("Monthly Pocket Money Allowance")
                    .date(today.minusDays(9))
                    .paymentMethod(PaymentMethod.UPI)
                    .build());

            // 2. Sample Expenses
            transactionService.createTransaction(userId, TransactionDtos.TransactionRequest.builder()
                    .type(TransactionType.EXPENSE)
                    .amount(BigDecimal.valueOf(180))
                    .categoryId(foodCat != null ? foodCat.getId() : null)
                    .merchant("Central Canteen")
                    .description("Biryani Lunch with Roommates")
                    .date(today.minusDays(1))
                    .paymentMethod(PaymentMethod.UPI)
                    .build());

            transactionService.createTransaction(userId, TransactionDtos.TransactionRequest.builder()
                    .type(TransactionType.EXPENSE)
                    .amount(BigDecimal.valueOf(350))
                    .categoryId(booksCat != null ? booksCat.getId() : null)
                    .merchant("Campus Book Stall")
                    .description("Engineering Mathematics Notes & Photocopy")
                    .date(today.minusDays(3))
                    .paymentMethod(PaymentMethod.CASH)
                    .build());

            transactionService.createTransaction(userId, TransactionDtos.TransactionRequest.builder()
                    .type(TransactionType.EXPENSE)
                    .amount(BigDecimal.valueOf(85))
                    .categoryId(commuteCat != null ? commuteCat.getId() : null)
                    .merchant("Delhi Metro")
                    .description("Metro Card Smart Recharge")
                    .date(today.minusDays(4))
                    .paymentMethod(PaymentMethod.UPI)
                    .build());

            transactionService.createTransaction(userId, TransactionDtos.TransactionRequest.builder()
                    .type(TransactionType.EXPENSE)
                    .amount(BigDecimal.valueOf(420))
                    .categoryId(funCat != null ? funCat.getId() : null)
                    .merchant("Cafe Coffee Day")
                    .description("Weekend Chai & Cold Coffee Hangout")
                    .date(today.minusDays(6))
                    .paymentMethod(PaymentMethod.UPI)
                    .build());

            // 3. Budgets
            if (foodCat != null) {
                budgetService.setBudget(userId, BudgetDtos.BudgetRequest.builder()
                        .categoryId(foodCat.getId())
                        .amount(BigDecimal.valueOf(3000))
                        .monthYear(currentYm)
                        .build());
            }
            if (funCat != null) {
                budgetService.setBudget(userId, BudgetDtos.BudgetRequest.builder()
                        .categoryId(funCat.getId())
                        .amount(BigDecimal.valueOf(1500))
                        .monthYear(currentYm)
                        .build());
            }
            if (booksCat != null) {
                budgetService.setBudget(userId, BudgetDtos.BudgetRequest.builder()
                        .categoryId(booksCat.getId())
                        .amount(BigDecimal.valueOf(1000))
                        .monthYear(currentYm)
                        .build());
            }

            // 4. Savings Goals
            goalService.createGoal(userId, GoalDtos.GoalRequest.builder()
                    .name("Goa Semester Trip")
                    .targetAmount(BigDecimal.valueOf(10000))
                    .currentAmount(BigDecimal.valueOf(3500))
                    .targetDate(today.plusMonths(2))
                    .icon("Palmtree")
                    .note("Trip with hostel friends after midterms")
                    .build());

            goalService.createGoal(userId, GoalDtos.GoalRequest.builder()
                    .name("Noise Cancelling Headphones")
                    .targetAmount(BigDecimal.valueOf(4500))
                    .currentAmount(BigDecimal.valueOf(2000))
                    .targetDate(today.plusMonths(1))
                    .icon("Headphones")
                    .note("For library focus sessions")
                    .build());

            // 5. Recurring Subscriptions
            if (subCat != null) {
                recurringService.createRecurring(userId, RecurringDtos.RecurringRequest.builder()
                        .categoryId(subCat.getId())
                        .amount(BigDecimal.valueOf(59))
                        .description("Spotify Student Subscription")
                        .frequency(Frequency.MONTHLY)
                        .nextDueDate(today.plusDays(12))
                        .active(true)
                        .build());

                recurringService.createRecurring(userId, RecurringDtos.RecurringRequest.builder()
                        .categoryId(subCat.getId())
                        .amount(BigDecimal.valueOf(299))
                        .description("Jio 5G Unlimited Recharge")
                        .frequency(Frequency.MONTHLY)
                        .nextDueDate(today.plusDays(18))
                        .active(true)
                        .build());
            }

            log.info("Demo student seeded successfully with initial transactions, budgets, and goals.");
        }
    }

    private Category findCategory(List<Category> list, String name) {
        return list.stream()
                .filter(c -> c.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElse(null);
    }
}
