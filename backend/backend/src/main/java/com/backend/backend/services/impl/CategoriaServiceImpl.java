package com.backend.backend.services.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.backend.dto.CategoriaDTO;
import com.backend.backend.dto.CategoriasConSubCategoriasDTO;
import com.backend.backend.error.BadReqException;
import com.backend.backend.error.NotFoundException;
import com.backend.backend.repositories.CategoriaRepository;
import com.backend.backend.services.CategoriaService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CategoriaServiceImpl implements CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Override
    public List<CategoriaDTO> list() throws NotFoundException {
        List<CategoriaDTO> ret = this.categoriaRepository.list();
        if (ret == null || ret.isEmpty()) {
            throw new NotFoundException("No se encontraron categorias");
        }
        return ret;
    }

    @Override
    public CategoriaDTO insert(CategoriaDTO categoria) throws BadReqException {

        if (categoria.getVigente() == null) {
            throw new BadReqException("No hay vigencia");
        }
        if (categoria.getCodigo() == null) {
            throw new BadReqException("No hay código");
        }
        if (categoria.getDescrip() == null) {
            throw new BadReqException("No hay descripción");
        }

        Map<String, Object> docData = new HashMap<>();
        docData.put("codigo", categoria.getCodigo());
        docData.put("descrip", categoria.getDescrip());
        docData.put("vigente", categoria.getVigente());

        return categoriaRepository.insert(categoria);
    }

    @Override
    public CategoriaDTO get(String idCategoria) throws NotFoundException, BadReqException {
        if (!(idCategoria instanceof String) || idCategoria.length() != 20) {
            throw new BadReqException("Parametros erroneos.");
        }
        CategoriaDTO ret = categoriaRepository.get(idCategoria);
        if (ret == null) {
            throw new NotFoundException("Categoría no encontrada.");
        }
        return ret;
    }

    @Override
    public List<CategoriasConSubCategoriasDTO> getAllCategoriasConSubCategorias() throws NotFoundException {
        throw new NotFoundException("No se encontraron datos");
        // Aquí puedes implementar tu lógica real si la necesitas en el futuro
    }
}
