package com.backend.backend.services.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.backend.dto.SubCategoriaDTO;
import com.backend.backend.error.BadReqException;
import com.backend.backend.error.NotFoundException;
import com.backend.backend.repositories.SubCategoriaRepository;
import com.backend.backend.services.SubCategoriaService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class SubCategoriaServiceImpl implements SubCategoriaService {

    @Autowired
    private SubCategoriaRepository subCategoriaRepository;

    @Override
    public SubCategoriaDTO get(String idSubCategoria) throws NotFoundException, BadReqException {

        if (idSubCategoria == null || idSubCategoria.length() != 20) {
            throw new BadReqException("El id proporcionado no es correcto");
        }

        SubCategoriaDTO ret = subCategoriaRepository.get(idSubCategoria);
        if (ret == null) {
            throw new NotFoundException("No se encontro la subcategoria seleccionada");
        }
        return ret;
    }

    @Override
    public SubCategoriaDTO insert(SubCategoriaDTO subCategoria) {
        Map<String, Object> docData = new HashMap<>();
        docData.put("codigo", subCategoria.getCodigo());
        docData.put("descrip", subCategoria.getDescrip());
        docData.put("vigente", subCategoria.getVigente());
        docData.put("idCategoria", subCategoria.getIdCategoria());
        String idInsertado = subCategoriaRepository.insert(subCategoria);
        if (idInsertado != null)
            return subCategoriaRepository.get(idInsertado);
        else
            return null;
    }

    @Override
    public List<SubCategoriaDTO> list() throws NotFoundException {
        List<SubCategoriaDTO> ret = subCategoriaRepository.list();
        if (ret == null || ret.isEmpty()) {
            throw new NotFoundException("No se encontraron subcategorias");
        }
        return ret;

    }

    @Override
    public List<SubCategoriaDTO> insertMultiple(List<SubCategoriaDTO> subCategorias) {
        List<SubCategoriaDTO> insertedSubCategorias = new ArrayList<>();

        for (SubCategoriaDTO subCategoria : subCategorias) {
            SubCategoriaDTO insertedSubCategoria = insert(subCategoria);// ESTO DEBERIA LLAMAR AL insert del service o
                                                                        // del repository??
            if (insertedSubCategoria != null) {
                insertedSubCategorias.add(insertedSubCategoria);
            } else {
                System.out.println("Error al insertar la subcategoria");
            }
        }

        return insertedSubCategorias;
    }

    @Override
    public List<SubCategoriaDTO> getPorIdCategoria(String idCategoria) throws NotFoundException, BadReqException {

        if (idCategoria == null || idCategoria.length() != 20) {
            throw new BadReqException("El id proporcionado no es correcto");
        }

        List<SubCategoriaDTO> ret = subCategoriaRepository.getPorIdCategoria(idCategoria);
        if (ret == null || ret.isEmpty()) {
            throw new NotFoundException("No se encontraron subcategorias");
        }
        return ret;
    }

}
