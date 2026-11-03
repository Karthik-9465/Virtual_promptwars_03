package com.ecocarbon.repository;

import com.ecocarbon.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByUserIdOrderByEarnedAtDesc(Long userId);
    Optional<Achievement> findByUserIdAndBadgeName(Long userId, String badgeName);
    boolean existsByUserIdAndBadgeName(Long userId, String badgeName);
    void deleteByUserId(Long userId);
}

