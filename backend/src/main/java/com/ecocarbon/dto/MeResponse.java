package com.ecocarbon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MeResponse {
    private Long id;
    private String email;
    private String name;
    private String role;
    private UserProfileDto profile;
    private List<BadgeDto> badges;

    public MeResponse() {
    }

    public MeResponse(Long id, String email, String name, String role, UserProfileDto profile, List<BadgeDto> badges) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.profile = profile;
        this.badges = badges;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @JsonProperty("_id")
    public String getMongoId() {
        return id != null ? id.toString() : null;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public UserProfileDto getProfile() {
        return profile;
    }

    public void setProfile(UserProfileDto profile) {
        this.profile = profile;
    }

    public List<BadgeDto> getBadges() {
        return badges;
    }

    public void setBadges(List<BadgeDto> badges) {
        this.badges = badges;
    }
}

