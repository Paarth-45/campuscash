package com.campuscash.controller;

import com.campuscash.common.ApiResponse;
import com.campuscash.config.CustomUserPrincipal;
import com.campuscash.model.Category;
import com.campuscash.model.TransactionType;
import com.campuscash.service.CategoryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getCategories(@AuthenticationPrincipal CustomUserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        List<Category> categories = categoryService.getCategoriesForUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @Data
    public static class CreateCategoryRequest {
        private String name;
        private String icon;
        private String color;
        private TransactionType type;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody CreateCategoryRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));

        Category category = categoryService.createCustomCategory(
                principal.getId(), request.getName(), request.getIcon(), request.getColor(), request.getType()
        );
        return ResponseEntity.ok(ApiResponse.ok("Category created", category));
    }
}
