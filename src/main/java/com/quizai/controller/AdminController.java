package com.quizai.controller;

import com.quizai.dto.AdminStatsDTO;
import com.quizai.dto.AdminUserDTO;
import com.quizai.dto.QuizHistoryDTO;
import com.quizai.repository.UserRepository;
import com.quizai.service.AdminService;
import com.quizai.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin-only endpoints for platform management")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;
    private final QuizService quizService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    @Operation(summary = "Get platform-wide statistics")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {

        List<AdminUserDTO> users = userRepository.findAll()
                .stream()
                .map(user -> AdminUserDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .createdAt(user.getCreatedAt())
                        .build())
                .toList();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{userId}/history")
    @Operation(summary = "Get quiz history for a specific user")
    public ResponseEntity<List<QuizHistoryDTO>> getUserHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(quizService.getUserHistory(userId));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Delete a user by ID")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userRepository.deleteById(userId);
        return ResponseEntity.noContent().build();
    }
}
