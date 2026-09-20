package com.backend.backend.dto;

import java.util.List;

import lombok.Data;

@Data
public class CategoriasConSubCategoriasDTO extends CategoriaDTO {
    private List<SubCategoriaDTO> subCategorias;
}
