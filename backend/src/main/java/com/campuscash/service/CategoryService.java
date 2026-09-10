package com.campuscash.service;

import com.campuscash.model.Category;
import com.campuscash.model.TransactionType;
import com.campuscash.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getCategoriesForUser(Long userId) {
        return categoryRepository.findAllAvailableForUser(userId);
    }

    public Category createCustomCategory(Long userId, String name, String icon, String color, TransactionType type) {
        Category category = Category.builder()
                .userId(userId)
                .name(name)
                .icon(icon != null ? icon : "tag")
                .color(color != null ? color : "#6366f1")
                .type(type != null ? type : TransactionType.EXPENSE)
                .build();
        return categoryRepository.save(category);
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElse(null);
    }
}
