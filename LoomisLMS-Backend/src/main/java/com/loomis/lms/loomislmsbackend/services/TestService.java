package com.loomis.lms.loomislmsbackend.services;

import com.loomis.lms.loomislmsbackend.dto.test.TestQuestionRequest;
import com.loomis.lms.loomislmsbackend.dto.test.TestAnswerOptionRequest;
import com.loomis.lms.loomislmsbackend.entity.*;
import com.loomis.lms.loomislmsbackend.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class TestService {

    @Autowired
    private TestQuestionRepository questionRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CourseRepository courseRepository;

    public List<TestQuestion> getQuestions(UUID courseId, UUID moduleId, UUID lessonId, UUID teacherId) {
        checkLessonOwnership(courseId, moduleId, lessonId, teacherId);

        return questionRepository.findAllByLesson_IdOrderByPositionAsc(lessonId);
    }

    @Transactional
    public TestQuestion createQuestion(UUID courseId, UUID moduleId, UUID lessonId, TestQuestionRequest request, UUID teacherId) {
        Lesson lesson = checkLessonOwnership(courseId, moduleId, lessonId, teacherId);

        validateRequest(request);

        TestQuestion question = new TestQuestion();

        question.setQuestion(request.question().trim());
        question.setType(request.type());
        question.setExplanation(request.explanation());
        question.setLesson(lesson);

        int position = questionRepository
                .findAllByLesson_IdOrderByPositionAsc(lessonId)
                .size();

        question.setPosition(position);

        updateAnswers(question, request);

        return questionRepository.save(question);
    }

    @Transactional
    public TestQuestion updateQuestion(UUID courseId, UUID moduleId, UUID lessonId, UUID questionId, TestQuestionRequest request, UUID teacherId) {
        checkLessonOwnership(courseId, moduleId, lessonId, teacherId);

        validateRequest(request);

        TestQuestion question = findQuestion(lessonId, questionId);

        question.setQuestion(request.question().trim());
        question.setType(request.type());
        question.setExplanation(request.explanation());

        question.getOptions().clear();
        question.getAcceptedTextAnswers().clear();

        updateAnswers(question, request);

        return questionRepository.save(question);
    }

    public void deleteQuestion(UUID courseId, UUID moduleId, UUID lessonId, UUID questionId, UUID teacherId) {
        checkLessonOwnership(courseId, moduleId, lessonId, teacherId);

        TestQuestion question = findQuestion(lessonId, questionId);

        questionRepository.delete(question);
    }

    private void updateAnswers(TestQuestion question, TestQuestionRequest request) {
        if (request.type() == QuestionType.TEXT) {
            question.setAcceptedTextAnswers(
                    request.acceptedTextAnswers() == null
                            ? List.of()
                            : request.acceptedTextAnswers().stream()
                            .filter(answer -> answer != null && !answer.isBlank())
                            .map(String::trim)
                            .distinct()
                            .toList()
            );

            return;
        }

        List<TestAnswerOptionRequest> options = request.options();

        for (int i = 0; i < options.size(); i++) {
            TestAnswerOptionRequest optionRequest = options.get(i);

            TestAnswerOption option = new TestAnswerOption();

            option.setText(optionRequest.text().trim());
            option.setCorrect(Boolean.TRUE.equals(optionRequest.correct()));
            option.setPosition(i);
            option.setQuestion(question);

            question.getOptions().add(option);
        }
    }

    private void validateRequest(TestQuestionRequest request) {
        if (request.question() == null || request.question().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Текст вопроса не может быть пустым"
            );
        }

        if (request.type() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Необходимо указать тип вопроса"
            );
        }

        if (request.type() == QuestionType.TEXT) {
            if (request.acceptedTextAnswers() == null ||
                    request.acceptedTextAnswers().stream()
                            .noneMatch(answer -> answer != null && !answer.isBlank())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Укажите хотя бы один правильный текстовый ответ"
                );
            }

            return;
        }

        if (request.options() == null || request.options().size() < 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Добавьте минимум два варианта ответа"
            );
        }

        if (request.options().stream()
                .anyMatch(option -> option.text() == null || option.text().isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Варианты ответа не могут быть пустыми"
            );
        }

        long correctCount = request.options().stream()
                .filter(option -> Boolean.TRUE.equals(option.correct()))
                .count();

        if (correctCount == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Укажите правильный ответ"
            );
        }

        if (request.type() == QuestionType.SINGLE_CHOICE && correctCount != 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Для вопроса с одним ответом должен быть выбран ровно один вариант"
            );
        }
    }

    private Lesson checkLessonOwnership(UUID courseId, UUID moduleId, UUID lessonId, UUID teacherId) {
        courseRepository.findByIdAndTeacher_Id(courseId, teacherId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Курс не найден"
                ));

        moduleRepository.findByIdAndCourse_Id(moduleId, courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Модуль не найден"
                ));

        Lesson lesson = lessonRepository.findByIdAndModule_Id(lessonId, moduleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Урок не найден"
                ));

        if (lesson.getType() != LessonType.TEST) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Вопросы можно добавлять только в тест"
            );
        }

        return lesson;
    }

    private TestQuestion findQuestion(UUID lessonId, UUID questionId) {
        return questionRepository.findByIdAndLesson_Id(questionId, lessonId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Вопрос не найден"
                ));
    }
}