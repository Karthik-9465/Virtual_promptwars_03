package com.ecocarbon.dto;

public class ChatResponse {
    private ChatMessageDto userMessage;
    private ChatMessageDto aiResponse;
    private String message;
    private String source;

    public ChatResponse() {
    }

    public ChatResponse(ChatMessageDto userMessage, ChatMessageDto aiResponse, String source) {
        this.userMessage = userMessage;
        this.aiResponse = aiResponse;
        this.message = aiResponse != null ? aiResponse.getText() : null;
        this.source = source != null ? source : "gemini";
    }

    public ChatMessageDto getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(ChatMessageDto userMessage) {
        this.userMessage = userMessage;
    }

    public ChatMessageDto getAiResponse() {
        return aiResponse;
    }

    public void setAiResponse(ChatMessageDto aiResponse) {
        this.aiResponse = aiResponse;
        if (aiResponse != null) {
            this.message = aiResponse.getText();
        }
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}

