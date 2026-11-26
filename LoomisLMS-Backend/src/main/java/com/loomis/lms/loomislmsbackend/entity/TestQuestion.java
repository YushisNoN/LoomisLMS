package com.loomis.lms.loomislmsbackend.entity;

package com.loomis.lms.loomislmsbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "test_questions")
@Getter
@Setter
public class TestQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(nullable = false)
    private Integer position = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @OneToMany(
            mappedBy = "question",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("position ASC")
    private List<TestAnswerOption> options = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
            name = "test_accepted_answers",
            joinColumns = @JoinColumn(name = "question_id")
    )
    @Column(name = "answer", nullable = false, columnDefinition = "TEXT")
    @OrderColumn(name = "answer_order")
    private List<String> acceptedTextAnswers = new ArrayList<>();
}