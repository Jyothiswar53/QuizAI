package com.quizai.service;

import com.quizai.dto.*;
import com.quizai.entity.*;
import com.quizai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {

        private final QuestionRepository questionRepository;
        private final QuizAttemptRepository quizAttemptRepository;
        private final QuestionAttemptRepository questionAttemptRepository;
        private final UserRepository userRepository;
        private final OpenAIService openAIService;

        @Transactional
        public List<QuestionDTO> generateQuiz(String topic,
                        String difficulty,
                        int count,
                        Long userId) {

                // Get all questions for this topic/difficulty
                List<Question> existingQuestions = questionRepository.findByTopicAndDifficulty(topic, difficulty);

                // Questions already attempted by this user
                List<Long> attemptedIds = questionAttemptRepository.findAttemptedQuestionIdsByUser(userId);

                // Keep only unseen questions
                List<Question> availableQuestions = new ArrayList<>();
                for (int i = 0; i < existingQuestions.size(); i++) {
                        Question question = existingQuestions.get(i);
                        if (!attemptedIds.contains(question.getId())) {
                                availableQuestions.add(question);
                        }
                }

                Collections.shuffle(availableQuestions);

                // If enough unseen questions exist, return them
                if (availableQuestions.size() >= count) {

                        List<QuestionDTO> result = new ArrayList<>();
                        for (int i = 0; i < count; i++) {
                                Question question = availableQuestions.get(i);
                                result.add(toDTO(question));
                        }
                        return result;
                }

                // Otherwise use all unseen questions first
                List<Question> finalQuestions = new ArrayList<>();

                while (finalQuestions.size() < count) {

                        List<QuestionDTO> aiQuestions = openAIService.generateQuestions(topic, difficulty, count);

                        for (int i = 0; i < aiQuestions.size(); i++) {

                                QuestionDTO dto = aiQuestions.get(i);
                                if (finalQuestions.size() >= count) {
                                        break;
                                }
                                if (!questionRepository.existsByQuestionText(dto.getQuestionText())) {

                                        Question question = Question.builder()
                                                        .topic(topic)
                                                        .difficulty(difficulty)
                                                        .questionText(dto.getQuestionText())
                                                        .optionA(dto.getOptionA())
                                                        .optionB(dto.getOptionB())
                                                        .optionC(dto.getOptionC())
                                                        .optionD(dto.getOptionD())
                                                        .correctAnswer(dto.getCorrectAnswer())
                                                        .generatedByAI(true)
                                                        .build();
                                        finalQuestions.add(questionRepository.save(question));
                                }
                        }
                }

                List<QuestionDTO> result = new ArrayList<>();

                for (int i = 0; i < finalQuestions.size(); i++) {
                        Question question = finalQuestions.get(i);
                        result.add(toDTO(question));
                }
                return result;
        }

        @Transactional
        public QuizResultResponse submitQuiz(QuizResultRequest request, Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                int correctCount = 0;
                List<QuizResultResponse.QuestionResultDTO> questionResults = new ArrayList<>();

                for (QuizResultRequest.AnswerDTO answer : request.getAnswers()) {
                        Question question = questionRepository.findById(answer.getQuestionId())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Question not found: " + answer.getQuestionId()));

                        boolean isCorrect = question.getCorrectAnswer().equalsIgnoreCase(answer.getSelectedAnswer());
                        if (isCorrect)
                                correctCount++;

                        questionResults.add(QuizResultResponse.QuestionResultDTO.builder()
                                        .questionId(question.getId())
                                        .questionText(question.getQuestionText())
                                        .optionA(question.getOptionA())
                                        .optionB(question.getOptionB())
                                        .optionC(question.getOptionC())
                                        .optionD(question.getOptionD())
                                        .correctAnswer(question.getCorrectAnswer())
                                        .selectedAnswer(answer.getSelectedAnswer())
                                        .isCorrect(isCorrect)
                                        .build());
                }

                int total = request.getAnswers().size();
                double percentage = 0;
                if (total > 0) {
                        percentage = (double) correctCount / total * 100;
                }

                String suggestedDifficulty = calculateAdaptiveDifficulty(request.getDifficulty(), percentage);

                QuizAttempt attempt = QuizAttempt.builder()
                                .user(user)
                                .topic(request.getTopic())
                                .difficulty(request.getDifficulty())
                                .score(correctCount)
                                .totalQuestions(total)
                                .timeTaken(request.getTimeTaken())
                                .build();

                QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

                for (int i = 0; i < request.getAnswers().size(); i++) {
                        QuizResultRequest.AnswerDTO answer = request.getAnswers().get(i);
                        Question question = questionRepository.findById(answer.getQuestionId()).orElseThrow();
                        QuestionAttempt qa = QuestionAttempt.builder()
                                        .quizAttempt(savedAttempt)
                                        .question(question)
                                        .selectedAnswer(answer.getSelectedAnswer())
                                        .isCorrect(questionResults.get(i).isCorrect())
                                        .build();
                        questionAttemptRepository.save(qa);
                }

                return QuizResultResponse.builder()
                                .attemptId(savedAttempt.getId())
                                .topic(request.getTopic())
                                .difficulty(request.getDifficulty())
                                .score(correctCount)
                                .totalQuestions(total)
                                .timeTaken(request.getTimeTaken())
                                .percentage(Math.round(percentage * 100.0) / 100.0)
                                .suggestedDifficulty(suggestedDifficulty)
                                .questionResults(questionResults)
                                .build();
        }

        public List<QuizHistoryDTO> getUserHistory(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<QuizAttempt> attempts = quizAttemptRepository.findByUserOrderByCreatedAtDesc(user);
                List<QuizHistoryDTO> history = new ArrayList<>();

                for (int i = 0; i < attempts.size(); i++) {

                        QuizAttempt attempt = attempts.get(i);
                        double percentage = 0;

                        if (attempt.getTotalQuestions() > 0) {
                                percentage = Math.round(
                                                (double) attempt.getScore() / attempt.getTotalQuestions() * 10000.0)
                                                / 100.0;
                        }
                        QuizHistoryDTO dto = QuizHistoryDTO.builder()
                                        .id(attempt.getId())
                                        .topic(attempt.getTopic())
                                        .difficulty(attempt.getDifficulty())
                                        .score(attempt.getScore())
                                        .totalQuestions(attempt.getTotalQuestions())
                                        .timeTaken(attempt.getTimeTaken())
                                        .percentage(percentage)
                                        .createdAt(attempt.getCreatedAt())
                                        .build();
                        history.add(dto);
                }
                return history;
        }

        private String calculateAdaptiveDifficulty(String currentDifficulty, double percentage) {
                if (percentage >= 80) {
                        String difficulty;
                        switch (currentDifficulty.toLowerCase()) {
                                case "easy":
                                        difficulty = "medium";
                                        break;

                                case "medium":
                                        difficulty = "hard";
                                        break;

                                default:
                                        difficulty = "hard";
                                        break;
                        }
                        return difficulty;

                } else if (percentage <= 40) {
                        String difficulty;
                        switch (currentDifficulty.toLowerCase()) {
                                case "hard":
                                        difficulty = "medium";
                                        break;
                                case "medium":
                                        difficulty = "easy";
                                        break;
                                default:
                                        difficulty = "easy";
                                        break;
                        }
                        return difficulty;
                }
                return currentDifficulty;
        }

        private QuestionDTO toDTO(Question q) {
                return QuestionDTO.builder()
                                .id(q.getId())
                                .topic(q.getTopic())
                                .difficulty(q.getDifficulty())
                                .questionText(q.getQuestionText())
                                .optionA(q.getOptionA())
                                .optionB(q.getOptionB())
                                .optionC(q.getOptionC())
                                .optionD(q.getOptionD())
                                .build();
        }
}
