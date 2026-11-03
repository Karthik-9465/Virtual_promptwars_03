package com.ecocarbon.dto;

public class ApiResponse {
    private String message;
    private Boolean success;

    public ApiResponse() {
    }

    public ApiResponse(String message) {
        this.message = message;
        this.success = true;
    }

    public ApiResponse(String message, Boolean success) {
        this.message = message;
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }
}

