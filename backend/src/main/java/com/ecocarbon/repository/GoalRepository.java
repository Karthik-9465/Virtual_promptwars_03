package com.ecocarbon.repository;

import com.ecocarbon.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdOrderByStartDateDesc(Long userId);
    Optional<Goal> findByIdAndUserId(Long id, Long userId);
    List<Goal> findByUserIdAndIsCompletedFalse(Long userId);
    long countByUserIdAndIsCompletedFalse(Long userId);
    long countByUserIdAndIsCompletedTrue(Long userId);
    void deleteByUserId(Long userId);
}

