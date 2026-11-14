package com.backend.backend.error.dto;

import org.springframework.http.HttpStatus;

import lombok.Data;

@Data
public class ErrorMessage {
    private HttpStatus httpStatus;
    private String message;

    public ErrorMessage(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
