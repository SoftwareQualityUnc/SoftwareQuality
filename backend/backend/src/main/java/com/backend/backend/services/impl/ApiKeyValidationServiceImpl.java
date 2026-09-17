package com.backend.backend.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.backend.backend.services.ApiKeyValidationService;

@Service
public class ApiKeyValidationServiceImpl implements ApiKeyValidationService {

    @Value("${API_KEY_INSERT}")
    private String apiKeyInsert;

    public boolean isValidApiKeyInsert(String authorizationHeader) {
        return authorizationHeader != null && authorizationHeader.equals("Bearer " + apiKeyInsert);
    }
}
