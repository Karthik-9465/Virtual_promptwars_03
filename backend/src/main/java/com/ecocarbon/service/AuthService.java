package com.ecocarbon.service;

import com.ecocarbon.dto.*;
import com.ecocarbon.entity.Achievement;
import com.ecocarbon.entity.Notification;
import com.ecocarbon.entity.User;
import com.ecocarbon.entity.UserProfile;
import com.ecocarbon.exception.BadRequestException;
import com.ecocarbon.exception.DuplicateResourceException;
import com.ecocarbon.exception.ResourceNotFoundException;
import com.ecocarbon.exception.UnauthorizedException;
import com.ecocarbon.repository.AchievementRepository;
import com.ecocarbon.repository.NotificationRepository;
import com.ecocarbon.repository.UserProfileRepository;
import com.ecocarbon.repository.UserRepository;
import com.ecocarbon.security.JwtTokenProvider;
import com.ecocarbon.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final AchievementRepository achievementRepository;
    private final NotificationRepository notificationRepository;
    private final CarbonCalculator carbonCalculator;
    private final CarbonCalculationService carbonCalculationService;
    private final GamificationService gamificationService;
    private final RecommendationService recommendationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       UserProfileRepository userProfileRepository,
                       AchievementRepository achievementRepository,
                       NotificationRepository notificationRepository,
                       CarbonCalculator carbonCalculator,
                       CarbonCalculationService carbonCalculationService,
                       GamificationService gamificationService,
                       RecommendationService recommendationService,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.achievementRepository = achievementRepository;
        this.notificationRepository = notificationRepository;
        this.carbonCalculator = carbonCalculator;
        this.carbonCalculationService = carbonCalculationService;
        this.gamificationService = gamificationService;
        this.recommendationService = recommendationService;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (req.getEmail() == null || !req.getEmail().contains("@")) {
            throw new BadRequestException("Provide a valid email address");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long");
        }
        if (req.getName() == null || req.getName().trim().length() < 2) {
            throw new BadRequestException("Name must be at least 2 characters long");
        }
        if (req.getLocation() == null || req.getLocation().trim().isEmpty()) {
            throw new BadRequestException("Location is required");
        }

        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already registered");
        }

        // 1. Password hashing
        String hash = passwordEncoder.encode(req.getPassword());

        // 2. Initial calculation
        CarbonCalculationRequest calcReq = new CarbonCalculationRequest();
        calcReq.setAgeGroup(req.getAgeGroup());
        calcReq.setLocation(req.getLocation());
        calcReq.setDiet(req.getDiet());
        calcReq.setTransportMode(req.getTransportMode());
        calcReq.setWeeklyDistanceKm(req.getWeeklyDistanceKm());
        calcReq.setElectricityKwhM(req.getElectricityKwhM());
        calcReq.setAcHoursPerDay(req.getAcHoursPerDay());
        calcReq.setFlightHoursPerYear(req.getFlightHoursPerYear());
        calcReq.setShoppingFrequency(req.getShoppingFrequency());
        calcReq.setWasteRecyclingRate(req.getWasteRecyclingRate());

        CarbonCalculationResponse calcResult = carbonCalculator.calculate(calcReq);

        // 3. Create User
        User user = new User(email, hash, req.getName().trim(), "user");
        userRepository.save(user);

        // 4. Create UserProfile
        UserProfile profile = new UserProfile(user);
        profile.setAgeGroup(req.getAgeGroup() != null ? req.getAgeGroup() : "professional");
        profile.setLocation(req.getLocation().trim());
        profile.setDiet(req.getDiet() != null ? req.getDiet() : "low_meat");
        profile.setTransportMode(req.getTransportMode() != null ? req.getTransportMode() : "car_petrol");
        profile.setWeeklyDistanceKm(req.getWeeklyDistanceKm() != null ? req.getWeeklyDistanceKm() : 0.0);
        profile.setElectricityKwhM(req.getElectricityKwhM() != null ? req.getElectricityKwhM() : 0.0);
        profile.setAcHoursPerDay(req.getAcHoursPerDay() != null ? req.getAcHoursPerDay() : 0.0);
        profile.setFlightHoursPerYear(req.getFlightHoursPerYear() != null ? req.getFlightHoursPerYear() : 0.0);
        profile.setShoppingFrequency(req.getShoppingFrequency() != null ? req.getShoppingFrequency() : "medium");
        profile.setWasteRecyclingRate(req.getWasteRecyclingRate() != null ? req.getWasteRecyclingRate() : 0.0);
        profile.setSustainabilityScore(calcResult.getSustainabilityScore());
        profile.setXpPoints(0);
        profile.setStreakDays(0);
        profile.setLastActiveDate(LocalDateTime.now());
        userProfileRepository.save(profile);

        // 5. Create initial FootprintRecord
        carbonCalculationService.recordCurrentMonthFootprint(user, calcResult);

        // 6. Award Initial Badge & Notification
        LocalDateTime now = LocalDateTime.now();
        Achievement initBadge = new Achievement(user, "Eco Beginner", now);
        achievementRepository.save(initBadge);

        Notification welcomeNotif = new Notification(
                user,
                "🌱 Welcome to EcoCarbon!",
                "Your account has been created successfully. We calculated your initial carbon footprint and awarded you the \"Eco Beginner\" badge!",
                "badge"
        );
        notificationRepository.save(welcomeNotif);

        // 7. Award XP (100 XP for Onboarding)
        gamificationService.awardXP(user.getId(), 100, "Profile Onboarding Setup");

        // 8. Generate recommendations
        recommendationService.generateForUser(user.getId());

        // 9. Sign JWT
        UserPrincipal principal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(principal);

        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole());
        return new AuthResponse(token, userDto);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            throw new BadRequestException("Provide email and password");
        }

        User user = userRepository.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Update streak
        gamificationService.updateStreak(user.getId());

        // Login notification
        Notification notification = new Notification(
                user,
                "🔑 Logged In Successfully",
                "Welcome back to EcoCarbon, " + user.getName() + "! Your active streak has been verified.",
                "general"
        );
        notificationRepository.save(notification);

        UserPrincipal principal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(principal);

        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole());
        return new AuthResponse(token, userDto);
    }

    @Transactional(readOnly = true)
    public MeResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        UserProfileDto profileDto = profile != null ? mapProfileToDto(profile) : null;

        List<Achievement> achievements = achievementRepository.findByUserIdOrderByEarnedAtDesc(userId);
        List<BadgeDto> badges = achievements.stream()
                .map(a -> new BadgeDto(a.getBadgeName(), a.getEarnedAt()))
                .collect(Collectors.toList());

        return new MeResponse(user.getId(), user.getEmail(), user.getName(), user.getRole(), profileDto, badges);
    }

    @Transactional(readOnly = true)
    public List<UserDto> listUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(u -> new UserDto(u.getId(), u.getEmail(), u.getName(), u.getRole()))
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUserRole(Long targetUserId, String newRole) {
        if (!"user".equalsIgnoreCase(newRole) && !"admin".equalsIgnoreCase(newRole)) {
            throw new BadRequestException("Role must be 'user' or 'admin'");
        }
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(newRole.toLowerCase());
        userRepository.save(user);
        return new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }

    @Transactional
    public void deleteUser(Long currentAdminId, Long targetUserId) {
        if (currentAdminId != null && currentAdminId.equals(targetUserId)) {
            throw new BadRequestException("You cannot delete your own administrative account");
        }
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userProfileRepository.deleteByUserId(targetUserId);
        userRepository.delete(user);
    }

    private UserProfileDto mapProfileToDto(UserProfile p) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(p.getId());
        dto.setUserId(p.getUser().getId());
        dto.setAgeGroup(p.getAgeGroup());
        dto.setLocation(p.getLocation());
        dto.setDiet(p.getDiet());
        dto.setTransportMode(p.getTransportMode());
        dto.setWeeklyDistanceKm(p.getWeeklyDistanceKm());
        dto.setElectricityKwhM(p.getElectricityKwhM());
        dto.setAcHoursPerDay(p.getAcHoursPerDay());
        dto.setFlightHoursPerYear(p.getFlightHoursPerYear());
        dto.setShoppingFrequency(p.getShoppingFrequency());
        dto.setWasteRecyclingRate(p.getWasteRecyclingRate());
        dto.setSustainabilityScore(p.getSustainabilityScore());
        dto.setXpPoints(p.getXpPoints());
        dto.setStreakDays(p.getStreakDays());
        dto.setLastActiveDate(p.getLastActiveDate());
        return dto;
    }
}

