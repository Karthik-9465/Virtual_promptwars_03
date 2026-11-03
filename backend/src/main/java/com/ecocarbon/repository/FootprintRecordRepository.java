package com.ecocarbon.repository;

import com.ecocarbon.entity.FootprintRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FootprintRecordRepository extends JpaRepository<FootprintRecord, Long> {
    List<FootprintRecord> findByUserIdOrderByRecordedMonthAsc(Long userId);
    Optional<FootprintRecord> findFirstByUserIdOrderByRecordedMonthDesc(Long userId);
    Optional<FootprintRecord> findByUserIdAndRecordedMonth(Long userId, LocalDate recordedMonth);
    void deleteByUserId(Long userId);
}

