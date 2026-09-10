package com.campuscash.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null userId means it is a global default category available to all students
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column
    private String icon;

    @Column
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TransactionType type = TransactionType.EXPENSE;
}
