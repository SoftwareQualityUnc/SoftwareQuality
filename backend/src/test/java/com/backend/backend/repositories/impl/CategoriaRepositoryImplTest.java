package com.backend.backend.repositories.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.backend.backend.dto.CategoriaDTO;
import com.backend.backend.firebase.FirebaseInitializer;
import com.google.api.core.ApiFutures;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;

class CategoriaRepositoryImplTest {
    private CategoriaRepositoryImpl repository;
    private CollectionReference collection;
    private DocumentReference document;
    private CategoriaDTO categoria;

    @BeforeEach
    void setUp() {
        FirebaseInitializer initializer = mock(FirebaseInitializer.class);
        Firestore firestore = mock(Firestore.class);
        collection = mock(CollectionReference.class);
        document = mock(DocumentReference.class);
        when(initializer.getFirestore()).thenReturn(firestore);
        when(firestore.collection("categorias")).thenReturn(collection);
        repository = new CategoriaRepositoryImpl(initializer);
        categoria = new CategoriaDTO();
        categoria.setDescrip("Hogar");
    }

    @Test
    void getReadsDocumentAndAssignsItsId() {
        DocumentSnapshot snapshot = mock(DocumentSnapshot.class);
        when(collection.document("category-id")).thenReturn(document);
        when(document.getId()).thenReturn("category-id");
        when(document.get()).thenReturn(ApiFutures.immediateFuture(snapshot));
        when(snapshot.toObject(CategoriaDTO.class)).thenReturn(categoria);
        assertSame(categoria, repository.get("category-id"));
        assertEquals("category-id", categoria.getIdCategoria());
    }

    @Test
    void insertWritesAndReadsCreatedCategory() {
        DocumentSnapshot snapshot = mock(DocumentSnapshot.class);
        when(collection.document()).thenReturn(document);
        when(collection.document("new-category")).thenReturn(document);
        when(document.getId()).thenReturn("new-category");
        when(document.set(categoria)).thenReturn(ApiFutures.immediateFuture(mock(WriteResult.class)));
        when(document.get()).thenReturn(ApiFutures.immediateFuture(snapshot));
        when(snapshot.toObject(CategoriaDTO.class)).thenReturn(categoria);
        assertSame(categoria, repository.insert(categoria));
        assertEquals("new-category", categoria.getIdCategoria());
    }

    @Test
    void listMapsDocumentsFromFirestore() {
        QuerySnapshot snapshot = mock(QuerySnapshot.class);
        QueryDocumentSnapshot item = mock(QueryDocumentSnapshot.class);
        when(collection.get()).thenReturn(ApiFutures.immediateFuture(snapshot));
        when(snapshot.getDocuments()).thenReturn(List.of(item));
        when(item.toObject(CategoriaDTO.class)).thenReturn(categoria);
        when(item.getId()).thenReturn("listed-category");
        assertEquals(List.of(categoria), repository.list());
        assertEquals("listed-category", categoria.getIdCategoria());
    }
}
