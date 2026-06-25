package com.quizai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizai.dto.QuestionDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAIService {

        private final WebClient openAIWebClient;
        private final ObjectMapper objectMapper;

        @Value("${gemini.model}")
        private String model;

        public List<QuestionDTO> generateQuestions(String topic,
                        String difficulty,
                        int count) {

                String prompt = buildPrompt(topic, difficulty, count);

                Map<String, Object> requestBody = Map.of(
                                "contents",
                                List.of(
                                                Map.of(
                                                                "parts",
                                                                List.of(
                                                                                Map.of(
                                                                                                "text",
                                                                                                prompt)))));

                try {
                        String response = openAIWebClient
                                        .post()
                                        .uri("/models/" + model + ":generateContent")
                                        .bodyValue(requestBody)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();

                        JsonNode root = objectMapper.readTree(response);

                        String content = root.path("candidates")
                                        .get(0)
                                        .path("content")
                                        .path("parts")
                                        .get(0)
                                        .path("text")
                                        .asText();

                        return parseQuestions(content);

                } catch (Exception e) {
                        throw new RuntimeException(e);
                }
        }

        private String buildPrompt(String topic,
                        String difficulty,
                        int count) {

                return """
                                Generate %d MCQ questions on "%s" difficulty "%s".
                                Return ONLY JSON.
                                [
                                  {
                                    "questionText":"...",
                                    "optionA":"...",
                                    "optionB":"...",
                                    "optionC":"...",
                                    "optionD":"...",
                                    "correctAnswer":"A"
                                  }
                                ]
                                """.formatted(count, topic, difficulty);
        }

        private List<QuestionDTO> parseQuestions(String json) throws Exception {

                json = json.replace("```json", "");
                json = json.replace("```", "");
                json = json.trim();

                JsonNode array = objectMapper.readTree(json);

                List<QuestionDTO> list = new ArrayList<>();

                for (int i = 0; i < array.size(); i++) {

                        JsonNode node = array.get(i);

                        String questionText = node.get("questionText").asText();
                        String optionA = node.get("optionA").asText();
                        String optionB = node.get("optionB").asText();
                        String optionC = node.get("optionC").asText();
                        String optionD = node.get("optionD").asText();
                        String correctAnswer = node.get("correctAnswer").asText();

                        QuestionDTO question = QuestionDTO.builder()
                                        .questionText(questionText)
                                        .optionA(optionA)
                                        .optionB(optionB)
                                        .optionC(optionC)
                                        .optionD(optionD)
                                        .correctAnswer(correctAnswer)
                                        .build();

                        list.add(question);
                }

                return list;
        }
}