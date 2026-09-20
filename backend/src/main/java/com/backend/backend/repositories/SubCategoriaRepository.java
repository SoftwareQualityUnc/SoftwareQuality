package com.backend.backend.repositories;

import java.util.List;

import com.backend.backend.dto.SubCategoriaDTO;

public interface SubCategoriaRepository {

    SubCategoriaDTO get(String idSubCategoria);

    String insert(SubCategoriaDTO subCategoria);

    List<SubCategoriaDTO> list();

    List<SubCategoriaDTO> getPorIdCategoria(String idCategoria);

}
