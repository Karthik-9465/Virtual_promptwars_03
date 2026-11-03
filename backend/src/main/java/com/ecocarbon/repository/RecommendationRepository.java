package com.ecocarbon.repository;

import com.ecocarbon.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByUserIdAndStatusOrderByImpactScoreDesc(Long userId, String status);
    Optional<Recommendation> findByIdAndUserId(Long id, Long userId);
    List<Recommendation> findByUserIdAndStatusIn(Long userId, Collection<String> statuses);
    long countByUserIdAndStatus(Long userId, String status);
    void deleteByUserIdAndStatus(Long userId, String status);
    void deleteByUserId(Long userId);
}

