package com.backend.backend.repositories;

import java.util.List;
import java.util.Map;

import com.backend.backend.dto.FiltroProductosDTO;
import com.backend.backend.dto.ProductoDTO;

public interface ProductoRepository {

    ProductoDTO get(String idProducto);

    List<ProductoDTO> list();

    List<ProductoDTO> getProductosPorFiltro(FiltroProductosDTO filtro);

    ProductoDTO insert(Map<String, Object> producto);

}
