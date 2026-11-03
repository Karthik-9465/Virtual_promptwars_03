package com.ecocarbon.service;

import com.ecocarbon.dto.ChatMessageDto;
import com.ecocarbon.dto.ChatResponse;
import com.ecocarbon.entity.ChatMessage;
import com.ecocarbon.entity.FootprintRecord;
import com.ecocarbon.entity.User;
import com.ecocarbon.entity.UserProfile;
import com.ecocarbon.exception.BadRequestException;
import com.ecocarbon.exception.ResourceNotFoundException;
import com.ecocarbon.repository.ChatMessageRepository;
import com.ecocarbon.repository.FootprintRecordRepository;
import com.ecocarbon.repository.UserProfileRepository;
import com.ecocarbon.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final FootprintRecordRepository footprintRecordRepository;
    private final GeminiService geminiService;

    public ChatService(ChatMessageRepository chatMessageRepository,
                       UserRepository userRepository,
                       UserProfileRepository userProfileRepository,
                       FootprintRecordRepository footprintRecordRepository,
                       GeminiService geminiService) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.footprintRecordRepository = footprintRecordRepository;
        this.geminiService = geminiService;
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getHistory(Long userId) {
        List<ChatMessage> messages = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId, PageRequest.of(0, 50));
        return messages.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public ChatResponse sendMessage(Long userId, String messageText) {
        if (messageText == null || messageText.trim().isEmpty()) {
            throw new BadRequestException("Message cannot be empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        FootprintRecord footprint = footprintRecordRepository.findFirstByUserIdOrderByRecordedMonthDesc(userId).orElse(null);

        // Fetch last 10 messages for conversation context
        List<ChatMessage> historyDesc = chatMessageRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 10));
        Collections.reverse(historyDesc);

        // Generate response
        Map<String, String> aiResult = geminiService.generateChatResponse(profile, footprint, messageText.trim(), historyDesc);
        String replyText = aiResult.getOrDefault("text", "I'm here to help you reduce your carbon footprint!");
        String source = aiResult.getOrDefault("source", "gemini");

        // Save user message and AI response
        ChatMessage userMsg = new ChatMessage(user, "user", messageText.trim());
        ChatMessage aiMsg = new ChatMessage(user, "assistant", replyText);

        chatMessageRepository.save(userMsg);
        chatMessageRepository.save(aiMsg);

        return new ChatResponse(mapToDto(userMsg), mapToDto(aiMsg), source);
    }

    @Transactional
    public void clearHistory(Long userId) {
        chatMessageRepository.deleteByUserId(userId);
    }

    public ChatMessageDto mapToDto(ChatMessage m) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(m.getId());
        dto.setUserId(m.getUser().getId());
        dto.setSender(m.getSender());
        dto.setText(m.getText());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}

