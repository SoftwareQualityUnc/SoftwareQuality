package com.backend.backend.repositories.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import com.backend.backend.dto.FiltroProductosDTO;
import com.backend.backend.dto.ProductoDTO;
import com.backend.backend.firebase.FirebaseInitializer;
import com.google.api.core.ApiFutures;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;

class ProductoFilterTest {
    private ProductoRepositoryImpl repository;
    private CollectionReference collection;
    private ProductoDTO product;

    @BeforeEach
    void setUp() {
        FirebaseInitializer initializer = mock(FirebaseInitializer.class);
        Firestore firestore = mock(Firestore.class);
        collection = mock(CollectionReference.class);
        QuerySnapshot snapshot = mock(QuerySnapshot.class);
        QueryDocumentSnapshot document = mock(QueryDocumentSnapshot.class);
        when(initializer.getFirestore()).thenReturn(firestore);
        when(firestore.collection("productos")).thenReturn(collection);
        when(collection.whereEqualTo(anyString(), any())).thenReturn(collection);
        when(collection.get()).thenReturn(ApiFutures.immediateFuture(snapshot));
        when(snapshot.iterator()).thenAnswer(invocation -> List.of(document).iterator());
        product = new ProductoDTO();
        product.setDescrip("Teclado Mecánico");
        when(document.toObject(ProductoDTO.class)).thenReturn(product);
        when(document.getId()).thenReturn("product-id");
        repository = new ProductoRepositoryImpl(initializer);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"teclado", "TECLADO", "mecánico"})
    void matchesDescriptionIgnoringCase(String description) {
        FiltroProductosDTO filter = new FiltroProductosDTO();
        filter.setDescrip(description);
        assertEquals(List.of(product), repository.getProductosPorFiltro(filter));
        assertEquals("product-id", product.getIdProducto());
        verify(collection).whereEqualTo("vigente", true);
    }

    @Test
    void excludesNonMatchingProducts() {
        FiltroProductosDTO filter = new FiltroProductosDTO();
        filter.setDescrip("monitor");
        assertEquals(List.of(), repository.getProductosPorFiltro(filter));
    }

    @Test
    void appliesCategoryAndSubcategoryWithoutRestrictingToFeaturedProducts() {
        FiltroProductosDTO filter = new FiltroProductosDTO();
        filter.setIdCategoria("cat");
        filter.setIdSubCategoria("subcat");
        assertEquals(List.of(product), repository.getProductosPorFiltro(filter));
        verify(collection).whereEqualTo("idCategoria", "cat");
        verify(collection).whereEqualTo("idSubCategoria", "subcat");
        verify(collection, never()).whereEqualTo("destacado", true);
    }

    @Test
    void defaultsToFeaturedProductsWithoutFilters() {
        repository.getProductosPorFiltro(new FiltroProductosDTO());
        verify(collection).whereEqualTo("destacado", true);
    }
}
