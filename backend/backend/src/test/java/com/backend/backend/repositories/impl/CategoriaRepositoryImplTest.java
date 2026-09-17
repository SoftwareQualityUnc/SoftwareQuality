package com.backend.backend.repositories.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import com.backend.backend.dto.CategoriaDTO;
import com.backend.backend.repositories.CategoriaRepository;

public class CategoriaRepositoryImplTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    private CategoriaDTO categoria;

    @BeforeEach
    void setUp() {
        categoriaRepository = mock(CategoriaRepository.class);

        categoria = new CategoriaDTO();
        categoria.setIdCategoria("1");
        categoria.setCodigo("test");
        categoria.setDescrip("test");
        categoria.setVigente(Boolean.TRUE);

    }

    @Test
    void testGet() {
        when(categoriaRepository.get("")).thenReturn(categoria);
        assertNotNull(categoriaRepository.get(""));
        assertEquals(categoria, categoriaRepository.get(""));
    }

    @Test
    void testInsert() {

    }

    @Test
    void testList() {

    }
}
