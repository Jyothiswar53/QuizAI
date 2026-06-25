package com.quizai.service;

import com.quizai.dto.LeaderboardDTO;
import com.quizai.repository.QuizAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final QuizAttemptRepository quizAttemptRepository;

    public List<LeaderboardDTO> getLeaderboard() {
        List<Object[]> rawResults = quizAttemptRepository.findLeaderboard();
        List<LeaderboardDTO> leaderboard = new ArrayList<>();

        for (int i = 0; i < rawResults.size(); i++) {
            Object[] row = rawResults.get(i);
            Long userId = ((Number) row[0]).longValue();
            String username = (String) row[1];
            int totalScore = ((Number) row[2]).intValue();
            int totalQuizzes = ((Number) row[3]).intValue();

            double avgScore = 0.0;
            if (row[4] != null) {
                avgScore = ((Number) row[4]).doubleValue();
            }
            avgScore = Math.round(avgScore * 100.0) / 100.0;

            leaderboard.add(LeaderboardDTO.builder()
                    .rank(i + 1)
                    .userId(userId)
                    .username(username)
                    .totalScore(totalScore)
                    .totalQuizzes(totalQuizzes)
                    .averageScore(Math.round(avgScore * 100.0) / 100.0)
                    .build());
        }

        return leaderboard;
    }
}
