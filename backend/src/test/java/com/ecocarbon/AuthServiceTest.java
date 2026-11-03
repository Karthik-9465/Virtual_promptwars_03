package com.ecocarbon;

import com.ecocarbon.dto.*;
import com.ecocarbon.entity.User;
import com.ecocarbon.exception.DuplicateResourceException;
import com.ecocarbon.exception.UnauthorizedException;
import com.ecocarbon.repository.AchievementRepository;
import com.ecocarbon.repository.NotificationRepository;
import com.ecocarbon.repository.UserProfileRepository;
import com.ecocarbon.repository.UserRepository;
import com.ecocarbon.security.JwtTokenProvider;
import com.ecocarbon.service.AuthService;
import com.ecocarbon.service.CarbonCalculationService;
import com.ecocarbon.service.CarbonCalculator;
import com.ecocarbon.service.GamificationService;
import com.ecocarbon.service.RecommendationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private CarbonCalculator carbonCalculator;

    @Mock
    private CarbonCalculationService carbonCalculationService;

    @Mock
    private GamificationService gamificationService;

    @Mock
    private RecommendationService recommendationService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("Test Register Duplicate Email Throws Exception")
    void testRegisterDuplicateEmail() {
        when(userRepository.existsByEmail("duplicate@test.com")).thenReturn(true);

        RegisterRequest req = new RegisterRequest();
        req.setEmail("duplicate@test.com");
        req.setPassword("password123");
        req.setName("Test Duplicate");
        req.setLocation("India");

        assertThrows(DuplicateResourceException.class, () -> authService.register(req));
    }

    @Test
    @DisplayName("Test Login Invalid Password Throws Exception")
    void testLoginInvalidPassword() {
        User user = new User("valid@test.com", "correct_hash", "Valid User", "user");
        when(userRepository.findByEmail("valid@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong_password", "correct_hash")).thenReturn(false);

        LoginRequest req = new LoginRequest("valid@test.com", "wrong_password");
        assertThrows(UnauthorizedException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("Test Login Valid Credentials Success")
    void testLoginSuccess() {
        User user = new User("valid@test.com", "correct_hash", "Valid User", "user");
        user.setId(10L);

        when(userRepository.findByEmail("valid@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct_password", "correct_hash")).thenReturn(true);
        when(tokenProvider.generateToken(any())).thenReturn("mock_jwt_token_12345");

        LoginRequest req = new LoginRequest("valid@test.com", "correct_password");
        AuthResponse res = authService.login(req);

        assertNotNull(res);
        assertEquals("mock_jwt_token_12345", res.getToken());
        assertEquals("valid@test.com", res.getUser().getEmail());
        assertEquals("Valid User", res.getUser().getName());
    }
}

