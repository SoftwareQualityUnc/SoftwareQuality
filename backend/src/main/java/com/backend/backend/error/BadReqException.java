package com.backend.backend.error;

public class BadReqException extends Exception {
    public BadReqException(String message) {
        super(message);
    }
}