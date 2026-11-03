package com.ecocarbon.controller;

import com.ecocarbon.dto.ChatMessageDto;
import com.ecocarbon.dto.ChatRequest;
import com.ecocarbon.dto.ChatResponse;
import com.ecocarbon.security.UserPrincipal;
import com.ecocarbon.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageDto>> getHistory(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(chatService.getHistory(user.getId()));
    }

    @PostMapping
    public ResponseEntity<ChatResponse> sendMessage(@AuthenticationPrincipal UserPrincipal user,
                                                    @RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(user.getId(), request.getMessage()));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Map<String, String>> clearHistory(@AuthenticationPrincipal UserPrincipal user) {
        chatService.clearHistory(user.getId());
        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "Chat history cleared successfully");
        return ResponseEntity.ok(response);
    }
}

