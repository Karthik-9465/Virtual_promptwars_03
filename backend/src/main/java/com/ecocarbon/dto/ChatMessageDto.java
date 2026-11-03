package com.ecocarbon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class ChatMessageDto {
    private Long id;
    private Long userId;
    private String sender;
    private String text;
    private LocalDateTime createdAt;

    public ChatMessageDto() {
    }

    public ChatMessageDto(Long id, Long userId, String sender, String text, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.sender = sender;
        this.text = text;
        this.createdAt = createdAt;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

