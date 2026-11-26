package com.loomis.lms.loomislmsbackend.services;

import com.loomis.lms.loomislmsbackend.dto.LessonBlockRequest;
import com.loomis.lms.loomislmsbackend.entity.Lesson;
import com.loomis.lms.loomislmsbackend.entity.LessonBlock;
import com.loomis.lms.loomislmsbackend.entity.LessonBlockType;
import com.loomis.lms.loomislmsbackend.entity.LessonType;
import com.loomis.lms.loomislmsbackend.repository.LessonBlockRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
public class LessonBlockService {

    private final LessonBlockRepository lessonBlockRepository;
    private final LessonService lessonService;

    public LessonBlockService(LessonBlockRepository lessonBlockRepository, LessonService lessonService) {
        this.lessonBlockRepository = lessonBlockRepository;
        this.lessonService = lessonService;
    }

    public List<LessonBlock> getBlocks(UUID courseId, UUID moduleId, UUID lessonId, UUID teacherId) {
        checkLecture(courseId, moduleId, lessonId, teacherId);

        return lessonBlockRepository
                .findAllByLesson_IdOrderByPositionAsc(lessonId);
    }

    @Transactional
    public LessonBlock createBlock(UUID courseId, UUID moduleId, UUID lessonId, LessonBlockRequest request, UUID teacherId) {
        Lesson lesson = checkLecture(
                courseId, moduleId, lessonId, teacherId
        );

        validateRequest(request);

        List<LessonBlock> blocks =
                lessonBlockRepository.findAllByLesson_IdOrderByPositionAsc(lessonId);

        int position = request.position() == null
                ? blocks.size()
                : Math.max(0, Math.min(request.position(), blocks.size()));

        for (LessonBlock block : blocks) {
            if (block.getPosition() >= position) {
                block.setPosition(block.getPosition() + 1);
            }
        }

        lessonBlockRepository.saveAll(blocks);

        LessonBlock block = new LessonBlock();
        block.setType(request.type());
        block.setContent(request.content());
        block.setPosition(position);
        block.setLesson(lesson);

        return lessonBlockRepository.save(block);
    }

    @Transactional
    public LessonBlock updateBlock(UUID courseId, UUID moduleId, UUID lessonId, UUID blockId, LessonBlockRequest request, UUID teacherId) {
        checkLecture(courseId, moduleId, lessonId, teacherId);
        validateRequest(request);

        LessonBlock block = findBlock(lessonId, blockId);

        block.setType(request.type());
        block.setContent(request.content());

        if (request.position() != null &&
                !request.position().equals(block.getPosition())) {

            List<LessonBlock> blocks =
                    lessonBlockRepository.findAllByLesson_IdOrderByPositionAsc(lessonId);

            blocks.removeIf(item -> item.getId().equals(blockId));

            int newPosition = Math.max(
                    0,
                    Math.min(request.position(), blocks.size())
            );

            blocks.add(newPosition, block);

            for (int i = 0; i < blocks.size(); i++) {
                blocks.get(i).setPosition(i);
            }

            lessonBlockRepository.saveAll(blocks);
        }

        return lessonBlockRepository.save(block);
    }

    @Transactional
    public void deleteBlock(UUID courseId, UUID moduleId, UUID lessonId, UUID blockId, UUID teacherId) {
        checkLecture(courseId, moduleId, lessonId, teacherId);

        LessonBlock block = findBlock(lessonId, blockId);

        lessonBlockRepository.delete(block);

        List<LessonBlock> blocks =
                lessonBlockRepository.findAllByLesson_IdOrderByPositionAsc(lessonId);

        for (int i = 0; i < blocks.size(); i++) {
            blocks.get(i).setPosition(i);
        }

        lessonBlockRepository.saveAll(blocks);
    }

    @Transactional
    public void reorderBlocks(UUID courseId, UUID moduleId, UUID lessonId, List<UUID> blockIds, UUID teacherId) {
        checkLecture(courseId, moduleId, lessonId, teacherId);

        List<LessonBlock> blocks =
                lessonBlockRepository.findAllByLesson_IdOrderByPositionAsc(lessonId);

        if (blockIds == null ||
                blockIds.size() != blocks.size() ||
                new HashSet<>(blockIds).size() != blockIds.size()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Некорректный порядок блоков"
            );
        }

        for (int i = 0; i < blockIds.size(); i++) {
            UUID blockId = blockIds.get(i);

            LessonBlock block = findBlock(lessonId, blockId);
            block.setPosition(i);
        }

        lessonBlockRepository.saveAll(blocks);
    }

    private Lesson checkLecture(UUID courseId, UUID moduleId, UUID lessonId, UUID teacherId) {
        Lesson lesson = lessonService.getLesson(
                courseId,
                moduleId,
                lessonId,
                teacherId
        );

        if (lesson.getType() != LessonType.LECTURE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Блоки доступны только для лекций"
            );
        }

        return lesson;
    }

    private LessonBlock findBlock(UUID lessonId, UUID blockId) {
        return lessonBlockRepository
                .findByIdAndLesson_Id(blockId, lessonId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Блок не найден"
                ));
    }

    private void validateRequest(LessonBlockRequest request) {
        if (request == null || request.type() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Необходимо указать тип блока"
            );
        }

        if (request.type() != LessonBlockType.DIVIDER &&
                (request.content() == null || request.content().isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Содержимое блока не может быть пустым"
            );
        }
    }
}