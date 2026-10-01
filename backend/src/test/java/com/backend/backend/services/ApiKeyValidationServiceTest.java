package com.backend.backend.services;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import com.backend.backend.services.impl.ApiKeyValidationServiceImpl;

class ApiKeyValidationServiceTest {
    private final ApiKeyValidationService service = new ApiKeyValidationServiceImpl("local-test-key");

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"Bearer wrong", "local-test-key", "Basic local-test-key", "Bearer local-test-key extra"})
    void rejectsMissingOrInvalidAuthorization(String header) {
        assertFalse(service.isValidApiKeyInsert(header));
    }

    @Test
    void acceptsConfiguredBearerKey() {
        assertTrue(service.isValidApiKeyInsert("Bearer local-test-key"));
    }
}
