package com.quizai.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "auth/login";
    }

    @GetMapping("/register")
    public String register() {
        return "auth/register";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/quiz/setup")
    public String quizSetup() {
        return "quiz/setup";
    }

    @GetMapping("/quiz/session")
    public String quizSession() {
        return "quiz/session";
    }

    @GetMapping("/quiz/result")
    public String quizResult() {
        return "quiz/result";
    }

    @GetMapping("/leaderboard")
    public String leaderboard() {
        return "leaderboard";
    }

    @GetMapping("/admin")
    public String adminDashboard() {
        return "admin/dashboard";
    }
}