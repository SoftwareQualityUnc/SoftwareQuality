package com.backend.backend.repositories.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.backend.backend.dto.CategoriaDTO;
import com.backend.backend.firebase.FirebaseInitializer;
import com.backend.backend.repositories.CategoriaRepository;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;

@Repository
public class CategoriaRepositoryImpl implements CategoriaRepository {

    private CollectionReference categoriasReference;

    public CategoriaRepositoryImpl(FirebaseInitializer firebaseInitializer) {
        this.categoriasReference = firebaseInitializer.getFirestore().collection("categorias");
    }

    @Override
    public List<CategoriaDTO> list() {
        List<CategoriaDTO> res = new ArrayList<>();
        CategoriaDTO categoria;

        ApiFuture<QuerySnapshot> query = categoriasReference.get();
        try {
            for (DocumentSnapshot doc : query.get().getDocuments()) {
                categoria = doc.toObject(CategoriaDTO.class);
                categoria.setIdCategoria(doc.getId());
                res.add(categoria);
            }
            return res;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public CategoriaDTO insert(CategoriaDTO categoria) {
        DocumentReference docRef = this.categoriasReference.document();
        ApiFuture<WriteResult> wrApi = docRef.set(categoria);
        try {
            if (null != wrApi.get()) {
                return get(docRef.getId());
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public CategoriaDTO get(String idCategoria) {
        DocumentReference categoriaRef = categoriasReference.document(idCategoria);
        try {
            CategoriaDTO ret = categoriaRef.get().get().toObject(CategoriaDTO.class);
            ret.setIdCategoria(categoriaRef.getId());
            return ret;

        } catch (Exception e) {
            System.err.println(e);
            return null;
        }
    }
}
