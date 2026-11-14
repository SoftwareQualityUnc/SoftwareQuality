package com.backend.backend.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.backend.dto.ProductoDTO;
import com.backend.backend.dto.SubCategoriaDTO;
import com.backend.backend.error.BadReqException;
import com.backend.backend.error.NotFoundException;
import com.backend.backend.repositories.SubCategoriaRepository;
import com.backend.backend.services.impl.SubCategoriaServiceImpl;

@ExtendWith(MockitoExtension.class)
public class SubCategoriaServiceTest {

    @Mock
    private SubCategoriaRepository subCategoriaRepository;

    @InjectMocks
    private SubCategoriaServiceImpl subCategoriaService;

    private SubCategoriaDTO subCategoria;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        subCategoria = new SubCategoriaDTO();
        subCategoria.setIdSubCategoria("abc123456789testidsc");
        subCategoria.setCodigo("codigocorrecto");
        subCategoria.setDescrip("esta es una categoria real");
        subCategoria.setVigente(Boolean.TRUE);
        subCategoria.setIdCategoria("xyz123456789testidcc");
    }

    @Test
    void testGetThrowBadRequest() throws Exception {
        assertThrows(BadReqException.class, () -> {
            subCategoriaService.get("shortId");
        });
        assertThrows(BadReqException.class, () -> {
            subCategoriaService.get("123456789123456789122222");
        });
        assertThrows(BadReqException.class, () -> {
            subCategoriaService.get(null);
        });
    }

    @Test
    void testGetThrowNotFound() throws Exception {
        when(subCategoriaRepository.get("abc123456789testidsc")).thenReturn(null);
        assertThrows(NotFoundException.class, () -> {
            subCategoriaService.get(subCategoria.getIdSubCategoria());
        });
    }

    @Test
    void testGetThrowBadRequestIdCat() throws Exception {
        assertThrows(BadReqException.class, () -> {
            subCategoriaService.getPorIdCategoria("shortIddd");
        });
        assertThrows(BadReqException.class, () -> {
            subCategoriaService.getPorIdCategoria("esteIdparalacategoriaesdemasiadoLargo123123");
        });
        assertThrows(BadReqException.class, () -> {
            subCategoriaService.getPorIdCategoria(null);
        });
    }

    @Test
    void testGetThrowNotFoundIdCat() throws Exception {
        when(subCategoriaRepository.getPorIdCategoria("xyz123456789testidcc")).thenReturn(null);
        assertThrows(NotFoundException.class, () -> {
            subCategoriaService.getPorIdCategoria(subCategoria.getIdCategoria());
        });
    }

}
