package com.ecocarbon.controller;

import com.ecocarbon.dto.CarbonCalculationRequest;
import com.ecocarbon.dto.CarbonCalculationResponse;
import com.ecocarbon.dto.FootprintRecordDto;
import com.ecocarbon.security.UserPrincipal;
import com.ecocarbon.service.CarbonCalculationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/footprint")
public class FootprintController {

    private final CarbonCalculationService carbonCalculationService;

    public FootprintController(CarbonCalculationService carbonCalculationService) {
        this.carbonCalculationService = carbonCalculationService;
    }

    @GetMapping("/history")
    public ResponseEntity<List<FootprintRecordDto>> getHistory(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(carbonCalculationService.getHistoryForUser(user.getId()));
    }

    @PostMapping("/calculate")
    public ResponseEntity<CarbonCalculationResponse> calculateCustom(@RequestBody CarbonCalculationRequest request) {
        return ResponseEntity.ok(carbonCalculationService.calculateCustom(request));
    }
}

