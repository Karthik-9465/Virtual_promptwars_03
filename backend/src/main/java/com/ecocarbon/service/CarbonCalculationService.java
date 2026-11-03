package com.ecocarbon.service;

import com.ecocarbon.dto.CarbonCalculationRequest;
import com.ecocarbon.dto.CarbonCalculationResponse;
import com.ecocarbon.dto.FootprintRecordDto;
import com.ecocarbon.entity.FootprintRecord;
import com.ecocarbon.entity.User;
import com.ecocarbon.entity.UserProfile;
import com.ecocarbon.repository.FootprintRecordRepository;
import com.ecocarbon.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarbonCalculationService {

    private final CarbonCalculator carbonCalculator;
    private final FootprintRecordRepository footprintRecordRepository;
    private final UserRepository userRepository;

    public CarbonCalculationService(CarbonCalculator carbonCalculator,
                                    FootprintRecordRepository footprintRecordRepository,
                                    UserRepository userRepository) {
        this.carbonCalculator = carbonCalculator;
        this.footprintRecordRepository = footprintRecordRepository;
        this.userRepository = userRepository;
    }

    public CarbonCalculationResponse calculateCustom(CarbonCalculationRequest request) {
        return carbonCalculator.calculate(request);
    }

    public CarbonCalculationResponse calculateForProfile(UserProfile profile) {
        CarbonCalculationRequest req = new CarbonCalculationRequest();
        req.setLocation(profile.getLocation());
        req.setDiet(profile.getDiet());
        req.setTransportMode(profile.getTransportMode());
        req.setWeeklyDistanceKm(profile.getWeeklyDistanceKm());
        req.setElectricityKwhM(profile.getElectricityKwhM());
        req.setAcHoursPerDay(profile.getAcHoursPerDay());
        req.setFlightHoursPerYear(profile.getFlightHoursPerYear());
        req.setShoppingFrequency(profile.getShoppingFrequency());
        req.setWasteRecyclingRate(profile.getWasteRecyclingRate());
        return carbonCalculator.calculate(req);
    }

    @Transactional
    public FootprintRecord recordCurrentMonthFootprint(User user, CarbonCalculationResponse calcResult) {
        LocalDate now = LocalDate.now();
        LocalDate recordedMonth = LocalDate.of(now.getYear(), now.getMonth(), 1);

        FootprintRecord record = footprintRecordRepository
                .findByUserIdAndRecordedMonth(user.getId(), recordedMonth)
                .orElse(new FootprintRecord());

        record.setUser(user);
        record.setRecordedMonth(recordedMonth);
        record.setTransportEmissions(calcResult.getTransportEmissions());
        record.setEnergyEmissions(calcResult.getEnergyEmissions());
        record.setFoodEmissions(calcResult.getFoodEmissions());
        record.setShoppingEmissions(calcResult.getShoppingEmissions());
        record.setWasteEmissions(calcResult.getWasteEmissions());
        record.setTotalEmissions(calcResult.getTotalEmissions());

        return footprintRecordRepository.save(record);
    }

    @Transactional(readOnly = true)
    public List<FootprintRecordDto> getHistoryForUser(Long userId) {
        List<FootprintRecord> records = footprintRecordRepository.findByUserIdOrderByRecordedMonthAsc(userId);
        return records.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public FootprintRecordDto mapToDto(FootprintRecord r) {
        FootprintRecordDto dto = new FootprintRecordDto();
        dto.setId(r.getId());
        dto.setUserId(r.getUser().getId());
        dto.setRecordedMonth(r.getRecordedMonth());
        dto.setTransportEmissions(r.getTransportEmissions());
        dto.setEnergyEmissions(r.getEnergyEmissions());
        dto.setFoodEmissions(r.getFoodEmissions());
        dto.setShoppingEmissions(r.getShoppingEmissions());
        dto.setWasteEmissions(r.getWasteEmissions());
        dto.setTotalEmissions(r.getTotalEmissions());
        return dto;
    }
}

