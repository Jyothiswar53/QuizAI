package com.quizai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class QuizResultRequest {

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @NotNull(message = "Answers are required")
    private List<AnswerDTO> answers;

    @NotNull(message = "Time taken is required")
    private Integer timeTaken;

    @Data
    public static class AnswerDTO {
        private Long questionId;
        private String selectedAnswer;
    }
}
