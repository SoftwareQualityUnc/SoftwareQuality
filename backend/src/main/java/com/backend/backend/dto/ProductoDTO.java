package com.backend.backend.dto;

import lombok.Data;

@Data
public class ProductoDTO {
    private String idProducto;
    private String descrip;
    private Float precio;
    private boolean vigente;
    private boolean conStock;
    private int cantStock;
    private String idSubCategoria;
    private String idCategoria;
    private String linkImagen;
    private Boolean destacado;
}
