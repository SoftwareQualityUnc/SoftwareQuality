package com.backend.backend.repositories.impl;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.function.Supplier;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import com.backend.backend.dto.CategoriaDTO;
import com.backend.backend.dto.FiltroProductosDTO;
import com.backend.backend.dto.SubCategoriaDTO;
import com.backend.backend.firebase.FirebaseInitializer;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;

class RepositoryFailureTest {
    private static final List<String> OPERATIONS = List.of(
            "categoria.list", "categoria.get", "categoria.insert", "producto.list", "producto.get",
            "producto.insert", "producto.filtro", "subcategoria.list", "subcategoria.get",
            "subcategoria.insert", "subcategoria.porCategoria");

    @TestFactory
    Stream<DynamicTest> restoresInterruptForEveryRepositoryOperation() {
        return IntStream.range(0, OPERATIONS.size()).mapToObj(index ->
            DynamicTest.dynamicTest(OPERATIONS.get(index) + " interrupted", () -> {
                Supplier<?> call = failingOperation(index, new InterruptedException("test interruption"));
                try {
                    assertSafeFallback(call.get());
                    assertTrue(Thread.currentThread().isInterrupted());
                } finally {
                    Thread.interrupted();
                }
            }));
    }

    @TestFactory
    Stream<DynamicTest> handlesDatabaseFailuresWithoutSettingInterruptFlag() {
        return IntStream.range(0, OPERATIONS.size()).mapToObj(index ->
            DynamicTest.dynamicTest(OPERATIONS.get(index) + " failed", () -> {
                Supplier<?> call = failingOperation(index,
                        new ExecutionException(new IllegalStateException("private diagnostic")));
                assertSafeFallback(call.get());
                assertFalse(Thread.currentThread().isInterrupted());
            }));
    }

    private void assertSafeFallback(Object result) {
        assertTrue(result == null || result instanceof List<?> list && list.isEmpty());
    }

    @SuppressWarnings("unchecked")
    private Supplier<?> failingOperation(int index, Exception failure) throws Exception {
        FirebaseInitializer initializer = mock(FirebaseInitializer.class);
        Firestore firestore = mock(Firestore.class);
        CollectionReference collection = mock(CollectionReference.class);
        DocumentReference document = mock(DocumentReference.class);
        ApiFuture<QuerySnapshot> queryFuture = mock(ApiFuture.class);
        ApiFuture<DocumentSnapshot> documentFuture = mock(ApiFuture.class);
        ApiFuture<WriteResult> writeFuture = mock(ApiFuture.class);
        when(initializer.getFirestore()).thenReturn(firestore);
        when(firestore.collection(anyString())).thenReturn(collection);
        when(collection.document(anyString())).thenReturn(document);
        when(collection.document()).thenReturn(document);
        when(collection.whereEqualTo(anyString(), any())).thenReturn(collection);
        when(collection.get()).thenReturn(queryFuture);
        when(document.get()).thenReturn(documentFuture);
        when(document.set(any())).thenReturn(writeFuture);
        when(document.set(any(Object.class))).thenReturn(writeFuture);
        when(queryFuture.get()).thenThrow(failure);
        when(documentFuture.get()).thenThrow(failure);
        when(writeFuture.get()).thenThrow(failure);
        CategoriaRepositoryImpl categoria = new CategoriaRepositoryImpl(initializer);
        ProductoRepositoryImpl producto = new ProductoRepositoryImpl(initializer);
        SubCategoriaRepositoryImpl subcategoria = new SubCategoriaRepositoryImpl(initializer);
        List<Supplier<?>> calls = List.of(
                categoria::list, () -> categoria.get("id"), () -> categoria.insert(new CategoriaDTO()),
                producto::list, () -> producto.get("id"), () -> producto.insert(Map.of()),
                () -> producto.getProductosPorFiltro(new FiltroProductosDTO()), subcategoria::list,
                () -> subcategoria.get("id"), () -> subcategoria.insert(new SubCategoriaDTO()),
                () -> subcategoria.getPorIdCategoria("id"));
        return calls.get(index);
    }
}
