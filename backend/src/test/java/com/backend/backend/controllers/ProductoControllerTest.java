package com.backend.backend.controllers;

import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import com.backend.backend.dto.ProductoDTO;
import com.backend.backend.error.RestResponseEntityExceptionHandler;
import com.backend.backend.repositories.ProductoRepository;
import com.backend.backend.services.impl.ApiKeyValidationServiceImpl;
import com.backend.backend.services.impl.ProductoServiceImpl;

class ProductoControllerTest {
    private static final String PRODUCT = """
            {"descrip":"Teclado","precio":100,"cantStock":3,
            "idCategoria":"12345678901234567890","idSubCategoria":"12345678901234567890",
            "linkImagen":"https://example.org/product.png","destacado":false}
            """;
    private MockMvc mvc;
    private ProductoRepository repository;

    @BeforeEach
    void setUp() {
        repository = mock(ProductoRepository.class);
        ProductoController controller = new ProductoController(new ProductoServiceImpl(repository),
                new ApiKeyValidationServiceImpl("local-test-key"));
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new RestResponseEntityExceptionHandler()).build();
    }

    @Test
    void rejectsUnauthorizedInsertBeforeWriting() throws Exception {
        mvc.perform(post("/api/v1/producto/new").contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer wrong").content(PRODUCT)).andExpect(status().isUnauthorized());
        verifyNoInteractions(repository);
    }

    @Test
    void singleInsertUsesServiceValidation() throws Exception {
        mvc.perform(post("/api/v1/producto/new").contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer local-test-key").content("{\"cantStock\":3}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(repository);
    }

    @Test
    void batchInsertUsesTheSameValidation() throws Exception {
        mvc.perform(post("/api/v1/producto/newMultiple").contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer local-test-key").content("[{\"cantStock\":3}]"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(repository);
    }

    @Test
    void acceptsValidAuthorizedProduct() throws Exception {
        when(repository.insert(anyMap())).thenReturn(new ProductoDTO());
        mvc.perform(post("/api/v1/producto/new").contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer local-test-key").content(PRODUCT)).andExpect(status().isOk());
        verify(repository).insert(anyMap());
    }
}
