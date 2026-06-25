package com.quizai.dto;

import com.quizai.entity.User.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDTO {

    private Long id;
    private String username;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
}