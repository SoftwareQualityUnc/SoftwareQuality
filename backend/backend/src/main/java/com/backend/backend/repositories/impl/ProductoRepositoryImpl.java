package com.backend.backend.repositories.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.backend.backend.dto.FiltroProductosDTO;
import com.backend.backend.dto.ProductoDTO;
import com.backend.backend.firebase.FirebaseInitializer;
import com.backend.backend.repositories.ProductoRepository;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;

@Repository
public class ProductoRepositoryImpl implements ProductoRepository {

    private final CollectionReference productosReference; // Para que se cree solo una instancia

    public ProductoRepositoryImpl(FirebaseInitializer firebaseInitializer) {
        this.productosReference = firebaseInitializer.getFirestore().collection("productos");
    }

    public List<ProductoDTO> list() {
        List<ProductoDTO> res = new ArrayList<>();
        ProductoDTO producto;

        ApiFuture<QuerySnapshot> query = productosReference.get();
        try {
            for (DocumentSnapshot doc : query.get().getDocuments()) {
                producto = doc.toObject(ProductoDTO.class);
                assert producto != null;
                producto.setIdProducto(doc.getId());
                res.add(producto);
            }
            return res;
        } catch (Exception e) {
            return null;
        }
    }

    public ProductoDTO get(String idProducto) {
        DocumentReference productoRef = productosReference.document(idProducto);
        try {
            DocumentSnapshot snap = productoRef.get().get();
            if (snap.exists()) {
                ProductoDTO prod = snap.toObject(ProductoDTO.class);
                assert prod != null;
                prod.setIdProducto(snap.getId());
                return prod;
            }
            return null;
        } catch (Exception e) {
            // TODO: handle exception
            return null;
        }
    }

    public ProductoDTO insert(Map<String, Object> pr) {
        DocumentReference docRef = productosReference.document();
        ApiFuture<WriteResult> wrApi = docRef.set(pr);
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
    public List<ProductoDTO> getProductosPorFiltro(FiltroProductosDTO filtro) {
        Query query = productosReference.whereEqualTo("vigente", true);
        List<ProductoDTO> ret = new ArrayList<>();
        ProductoDTO tmp;
        if (filtro.getIdCategoria() != null) {
            query = query.whereEqualTo("idCategoria", filtro.getIdCategoria());
        }
        if (filtro.getIdSubCategoria() != null) {
            query = query.whereEqualTo("idSubCategoria", filtro.getIdSubCategoria());
        }
        if (filtro.getIdSubCategoria() == null && filtro.getIdCategoria() == null && (filtro.getDescrip() == null
                || filtro.getDescrip().length() == 0)) {
            query = query.whereEqualTo("destacado", Boolean.TRUE);
        }

        try {
            QuerySnapshot querySnap = query.get().get();
            for (DocumentSnapshot doc : querySnap) {
                tmp = doc.toObject(ProductoDTO.class);
                tmp.setIdProducto(doc.getId());
                if (filtro.getDescrip() != null && filtro.getDescrip().length() != 0) {
                    if (tmp.getDescrip().toLowerCase().contains(filtro.getDescrip().toLowerCase())) {
                        ret.add(tmp);
                    }
                } else
                    ret.add(tmp);
            }
            return ret;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }
}
