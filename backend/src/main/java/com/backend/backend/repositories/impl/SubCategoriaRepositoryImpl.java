package com.backend.backend.repositories.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.backend.backend.dto.SubCategoriaDTO;
import com.backend.backend.firebase.FirebaseInitializer;
import com.backend.backend.repositories.SubCategoriaRepository;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;

@Repository
public class SubCategoriaRepositoryImpl implements SubCategoriaRepository {

    private CollectionReference subCategoriasReference;

    public SubCategoriaRepositoryImpl(FirebaseInitializer firebaseInitializer) {
        this.subCategoriasReference = firebaseInitializer.getFirestore().collection("subCategorias");
    }

    @Override
    public SubCategoriaDTO get(String idSubCategoria) {
        try {
            DocumentReference docRef = subCategoriasReference.document(idSubCategoria);
            SubCategoriaDTO ret = docRef.get().get().toObject(SubCategoriaDTO.class);
            if (ret != null) {
                ret.setIdSubCategoria(docRef.getId());
                return ret;
            } else
                return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public String insert(SubCategoriaDTO subCategoria) {
        DocumentReference docRef = subCategoriasReference.document();
        ApiFuture<WriteResult> wrApi = docRef.set(subCategoria);
        try {
            if (null != wrApi.get()) {
                return docRef.getId(); // Devuelvo el id insertado
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public List<SubCategoriaDTO> list() {
        List<SubCategoriaDTO> res = new ArrayList<>();
        SubCategoriaDTO tmp;

        ApiFuture<QuerySnapshot> query = subCategoriasReference.get();
        try {
            for (DocumentSnapshot doc : query.get().getDocuments()) {
                tmp = doc.toObject(SubCategoriaDTO.class);
                if (tmp != null) {
                    tmp.setIdSubCategoria(doc.getId());
                    res.add(tmp);
                } else {
                    System.err.println("Una subCategoria vino null");
                }
            }
            return res;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public List<SubCategoriaDTO> getPorIdCategoria(String idCategoria) {
        Query query = subCategoriasReference.whereEqualTo("vigente", true).whereEqualTo("idCategoria", idCategoria);
        List<SubCategoriaDTO> res = new ArrayList<>();
        SubCategoriaDTO tmp;
        try {
            QuerySnapshot querySnap = query.get().get();
            for (DocumentSnapshot doc : querySnap) {
                tmp = doc.toObject(SubCategoriaDTO.class);
                tmp.setIdSubCategoria(doc.getId());
                res.add(tmp);
            }
            return res;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
