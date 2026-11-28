package com.loomis.lms.loomislmsbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lessons")
@Getter
@Setter
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LessonType type;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Integer position = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @OneToMany(
            mappedBy = "lesson",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("position ASC")
    private List<TestQuestion> questions = new ArrayList<>();

    @OneToMany(
            mappedBy = "lesson",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("position ASC")
    private List<LessonBlock> blocks = new ArrayList<>();


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}