package com.ecocarbon.controller;

import com.ecocarbon.dto.*;
import com.ecocarbon.security.UserPrincipal;
import com.ecocarbon.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        MeResponse response = authService.getMe(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        return ResponseEntity.ok(new ApiResponse("Logged out successfully"));
    }

    // Admin User CRUD Endpoints
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> listUsers() {
        return ResponseEntity.ok(authService.listUsers());
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        return ResponseEntity.ok(authService.updateUserRole(id, role));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal admin) {
        authService.deleteUser(admin.getId(), id);
        return ResponseEntity.ok(new ApiResponse("User and profile successfully deleted"));
    }
}

