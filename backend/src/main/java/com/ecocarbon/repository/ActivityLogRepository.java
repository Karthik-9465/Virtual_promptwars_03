package com.ecocarbon.repository;

import com.ecocarbon.entity.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    void deleteByUserId(Long userId);
}

