package com.quizai.repository;

import com.quizai.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByTopicAndDifficulty(String topic, String difficulty);

    boolean existsByQuestionText(String questionText);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.topic = :topic")
    long countByTopic(String topic);

    @Query("SELECT q.topic, COUNT(q) FROM Question q GROUP BY q.topic")
    List<Object[]> countGroupByTopic();
}
