package com.backend.backend.services;

public interface ApiKeyValidationService {

    public boolean isValidApiKeyInsert(String authorizationHeader);
}
