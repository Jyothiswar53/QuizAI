package com.quizai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuizRequest {

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @Min(value = 1, message = "At least 1 question required")
    @Max(value = 20, message = "Maximum 20 questions allowed")
    private int numberOfQuestions = 10;
}
