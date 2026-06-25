package com.quizai.repository;

import com.quizai.entity.QuizAttempt;
import com.quizai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT qa.user.id, qa.user.username, SUM(qa.score), COUNT(qa), AVG(CAST(qa.score AS double) / qa.totalQuestions * 100) " +
           "FROM QuizAttempt qa GROUP BY qa.user.id, qa.user.username " +
           "ORDER BY SUM(qa.score) DESC")
    List<Object[]> findLeaderboard();

    @Query("SELECT COUNT(qa) FROM QuizAttempt qa")
    long countTotal();

    @Query("SELECT AVG(CAST(qa.score AS double) / qa.totalQuestions * 100) FROM QuizAttempt qa")
    Double findAverageScore();

    @Query("SELECT qa.difficulty, COUNT(qa) FROM QuizAttempt qa GROUP BY qa.difficulty")
    List<Object[]> countGroupByDifficulty();

    @Query("SELECT qa.topic, COUNT(qa) FROM QuizAttempt qa GROUP BY qa.topic")
    List<Object[]> countGroupByTopic();
}
