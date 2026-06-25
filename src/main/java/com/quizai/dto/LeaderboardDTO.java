package com.quizai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDTO {
    private int rank;
    private Long userId;
    private String username;
    private int totalScore;
    private int totalQuizzes;
    private double averageScore;
}
