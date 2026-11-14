package com.backend.backend.dto;

import lombok.Data;

@Data
public class SubCategoriaDTO {

    private String idSubCategoria;
    private String codigo;
    private String descrip;
    private String idCategoria;
    private Boolean vigente;
}
