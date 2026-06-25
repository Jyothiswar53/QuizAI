package com.quizai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizHistoryDTO {
    private Long id;
    private String topic;
    private String difficulty;
    private int score;
    private int totalQuestions;
    private int timeTaken;
    private double percentage;
    private LocalDateTime createdAt;
}
