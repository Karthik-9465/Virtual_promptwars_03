package com.ecocarbon.controller;

import com.ecocarbon.dto.CarbonCalculationRequest;
import com.ecocarbon.dto.UserProfileDto;
import com.ecocarbon.security.UserPrincipal;
import com.ecocarbon.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(@AuthenticationPrincipal UserPrincipal user,
                                                             @RequestBody CarbonCalculationRequest data) {
        return ResponseEntity.ok(profileService.updateProfile(user.getId(), data));
    }
}

