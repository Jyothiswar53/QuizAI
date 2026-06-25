package com.quizai.repository;

import com.quizai.entity.QuestionAttempt;
import com.quizai.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionAttemptRepository extends JpaRepository<QuestionAttempt, Long> {
    List<QuestionAttempt> findByQuizAttempt(QuizAttempt quizAttempt);

    @Query("""
                SELECT qa.question.id
                FROM QuestionAttempt qa
                WHERE qa.quizAttempt.user.id = :userId """)
    List<Long> findAttemptedQuestionIdsByUser(@Param("userId") Long userId);
}
