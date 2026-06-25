package com.quizai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {
    private long totalUsers;
    private long totalQuizzes;
    private long totalQuestions;
    private double averageScore;
    private Map<String, Long> quizzesByDifficulty;
    private Map<String, Long> quizzesByTopic;
}
