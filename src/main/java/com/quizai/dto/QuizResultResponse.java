package com.quizai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultResponse {
    private Long attemptId;
    private String topic;
    private String difficulty;
    private int score;
    private int totalQuestions;
    private int timeTaken;
    private double percentage;
    private String suggestedDifficulty;
    private List<QuestionResultDTO> questionResults;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResultDTO {
        private Long questionId;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctAnswer;
        private String selectedAnswer;
        private boolean isCorrect;
    }
}
