package com.backend.backend.repositories;

import java.util.List;

import com.backend.backend.dto.CategoriaDTO;

public interface CategoriaRepository {

    CategoriaDTO get(String idCategoria);

    List<CategoriaDTO> list();

    CategoriaDTO insert(CategoriaDTO categoria);

}
