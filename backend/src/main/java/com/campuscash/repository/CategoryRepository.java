package com.campuscash.repository;

import com.campuscash.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Return all global categories (userId is null) plus categories created by this specific user
    @Query("SELECT c FROM Category c WHERE c.userId IS NULL OR c.userId = :userId ORDER BY c.id ASC")
    List<Category> findAllAvailableForUser(@Param("userId") Long userId);

    List<Category> findByUserIdIsNull();
}
