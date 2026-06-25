package com.quizai.controller;

import com.quizai.dto.*;
import com.quizai.security.JwtUtil;
import com.quizai.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
@Tag(name = "Quiz", description = "Quiz generation, submission, and history")
@SecurityRequirement(name = "bearerAuth")
public class QuizController {

    private final QuizService quizService;
    private final JwtUtil jwtUtil;

    @PostMapping("/generate")
    @Operation(summary = "Generate AI quiz questions")
    public ResponseEntity<List<QuestionDTO>> generateQuiz(
            @Valid @RequestBody QuizRequest request,
            @RequestHeader("Authorization") String authHeader) {

        Long userId = extractUserId(authHeader);
        List<QuestionDTO> questions = quizService.generateQuiz(
                request.getTopic(),
                request.getDifficulty(),
                request.getNumberOfQuestions(),
                userId);
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit quiz answers and get results")
    public ResponseEntity<QuizResultResponse> submitQuiz(
            @Valid @RequestBody QuizResultRequest request,
            @RequestHeader("Authorization") String authHeader) {

        Long userId = extractUserId(authHeader);
        QuizResultResponse result = quizService.submitQuiz(request, userId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    @Operation(summary = "Get authenticated user's quiz history")
    public ResponseEntity<List<QuizHistoryDTO>> getHistory(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(quizService.getUserHistory(userId));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.extractUserId(token);
    }
}
