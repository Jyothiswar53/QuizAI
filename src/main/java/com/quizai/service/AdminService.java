package com.quizai.service;

import com.quizai.dto.AdminStatsDTO;
import com.quizai.repository.QuizAttemptRepository;
import com.quizai.repository.QuestionRepository;
import com.quizai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuestionRepository questionRepository;

    public AdminStatsDTO getStats() {

        long totalUsers = userRepository.count();
        long totalQuizzes = quizAttemptRepository.countTotal();
        long totalQuestions = questionRepository.count();

        Double rawAvg = quizAttemptRepository.findAverageScore();
        double averageScore;

        if (rawAvg != null) {
            averageScore = Math.round(rawAvg * 100.0) / 100.0;
        } else {
            averageScore = 0.0;
        }

        Map<String, Long> quizzesByDifficulty = new HashMap<>();
        List<Object[]> difficultyRows = quizAttemptRepository.countGroupByDifficulty();

        for (int i = 0; i < difficultyRows.size(); i++) {
            Object[] row = difficultyRows.get(i);
            quizzesByDifficulty.put((String) row[0], ((Number) row[1]).longValue());
        }

        Map<String, Long> quizzesByTopic = new HashMap<>();
        List<Object[]> topicRows = quizAttemptRepository.countGroupByTopic();

        for (int i = 0; i < topicRows.size(); i++) {
            Object[] row = topicRows.get(i);
            quizzesByTopic.put((String) row[0], ((Number) row[1]).longValue());
        }

        return AdminStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalQuizzes(totalQuizzes)
                .totalQuestions(totalQuestions)
                .averageScore(averageScore)
                .quizzesByDifficulty(quizzesByDifficulty)
                .quizzesByTopic(quizzesByTopic)
                .build();
    }
}