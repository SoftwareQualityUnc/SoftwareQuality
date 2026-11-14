package com.backend.backend.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.backend.dto.CategoriaDTO;
import com.backend.backend.error.BadReqException;
import com.backend.backend.error.NotFoundException;
import com.backend.backend.repositories.CategoriaRepository;
import com.backend.backend.services.impl.CategoriaServiceImpl;

@ExtendWith(MockitoExtension.class)
public class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private CategoriaServiceImpl categoriaService;

    private CategoriaDTO categoria;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        categoria = new CategoriaDTO();
        categoria.setIdCategoria("12345678910234567892");
        categoria.setCodigo("test");
        categoria.setDescrip("test");
        categoria.setVigente(Boolean.TRUE);
    }

    @Test
    @DisplayName("Test: get() throws BadReqException for invalid id")
    void testGetThrowBadRequest() {
        assertThrows(BadReqException.class, () -> {
            categoriaService.get("shortId");
        });
        assertThrows(BadReqException.class, () -> {
            categoriaService.get("longId123123123123123");
        });
        assertThrows(BadReqException.class, () -> {
            categoriaService.get(null);
        });
    }

    @Test
    @DisplayName("Test: get() throws NotFoundException for non-existing category")
    void testGetThrowNotFoundException() {
        when(categoriaRepository.get(categoria.getIdCategoria())).thenReturn(null);
        assertThrows(NotFoundException.class, () -> {
            categoriaService.get(categoria.getIdCategoria());
        });
    }

    @Test
    @DisplayName("Test: get() returns category for valid id")
    void testGet() throws Exception {
        when(categoriaRepository.get(categoria.getIdCategoria())).thenReturn(this.categoria);
        CategoriaDTO ret = categoriaService.get(categoria.getIdCategoria());
        assertEquals(categoria, ret);
    }

    @Test
    void testInsertThrowsBadRequest() throws Exception {
        CategoriaDTO tmp = new CategoriaDTO();
        tmp.setCodigo("test");
        tmp.setDescrip("test");
        tmp.setVigente(null);
        // SIN VIGENCIA
        assertThrows(BadReqException.class, () -> {
            categoriaService.insert(tmp);
        });
        tmp.setVigente(true);
        tmp.setCodigo(null);
        assertThrows(BadReqException.class, () -> {
            categoriaService.insert(tmp);
        });
        tmp.setDescrip(null);
        tmp.setCodigo("test");
        assertThrows(BadReqException.class, () -> {
            categoriaService.insert(tmp);
        });
    }

    @Test
    void testListThrowsNotFound() throws Exception {
        List<CategoriaDTO> res = new ArrayList<>();
        when(categoriaRepository.list()).thenReturn(null);
        assertThrows(NotFoundException.class, () -> {
            categoriaService.list();
        });
        when(categoriaRepository.list()).thenReturn(res);
        assertThrows(NotFoundException.class, () -> {
            categoriaService.list();
        });

    }
}
