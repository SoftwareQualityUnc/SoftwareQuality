package com.backend.backend.services;

import java.util.List;

import com.backend.backend.dto.CategoriaDTO;
import com.backend.backend.dto.CategoriasConSubCategoriasDTO;
import com.backend.backend.error.BadReqException;
import com.backend.backend.error.NotFoundException;

public interface CategoriaService {

    List<CategoriaDTO> list() throws NotFoundException;

    List<CategoriasConSubCategoriasDTO> getAllCategoriasConSubCategorias() throws NotFoundException;

    CategoriaDTO insert(CategoriaDTO categoria) throws BadReqException;

    CategoriaDTO get(String idCategoria) throws NotFoundException, BadReqException;
}
