import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import productoApi from "../src/api/productoApi";
import ItemList from "../src/components/Home/ItemListContainer/ItemList";
import { FiltroProductosContext } from "../src/context/FiltroProductosContext";

vi.mock("../src/api/productoApi", () => ({
  default: { getProductosPorFiltro: vi.fn() },
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function catalogue(filter = {}) {
  return (
    <MemoryRouter>
      <FiltroProductosContext.Provider value={{ filtroProductos: filter }}>
        <ItemList />
      </FiltroProductosContext.Provider>
    </MemoryRouter>
  );
}

it("shows a loading state while the debounced request is pending", () => {
  productoApi.getProductosPorFiltro.mockReturnValue(new Promise(() => {}));
  render(catalogue());
  expect(screen.getByRole("status").textContent).toContain("Cargando productos");
});

it("shows a useful empty state when no products match", async () => {
  productoApi.getProductosPorFiltro.mockResolvedValue({ data: [] });
  render(catalogue());
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(screen.getByRole("status").textContent).toContain("No encontramos productos");
});

it("renders product, stock, formatted price, and detail link", async () => {
  productoApi.getProductosPorFiltro.mockResolvedValue({
    data: [
      {
        idProducto: "p1",
        descrip: "Placa de video",
        precio: 100000,
        conStock: true,
        cantStock: 4,
        linkImagen: "https://example.org/gpu.png",
      },
    ],
  });

  render(catalogue({ descrip: "graphics" }));
  await act(() => vi.advanceTimersByTimeAsync(500));

  expect(screen.getByText("Placa de video")).toBeTruthy();
  expect(screen.getByText(/\$\s*100\.000/)).toBeTruthy();
  expect(screen.getByText("En stock · 4 disponibles")).toBeTruthy();
  expect(screen.getByRole("link", { name: /ver placa de video/i }).getAttribute("href")).toBe(
    "/detalle/p1"
  );
  expect(productoApi.getProductosPorFiltro).toHaveBeenCalledWith({ descrip: "graphics" });
});

it("renders an out-of-stock product state", async () => {
  productoApi.getProductosPorFiltro.mockResolvedValue({
    data: [
      {
        idProducto: "p2",
        descrip: "Procesador",
        precio: 450,
        conStock: false,
        cantStock: 0,
      },
    ],
  });

  render(catalogue());
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(screen.getByText("Sin stock")).toBeTruthy();
});

it("reports a safe loading error without exposing internal details", async () => {
  productoApi.getProductosPorFiltro.mockRejectedValue(
    new Error("private server diagnostic")
  );
  render(catalogue());
  await act(() => vi.advanceTimersByTimeAsync(500));

  expect(screen.getByRole("alert").textContent).toContain("No pudimos cargar los productos");
  expect(screen.queryByText("private server diagnostic")).toBeNull();
});

it("ignores an old response after filters change", async () => {
  let resolveOldRequest;
  productoApi.getProductosPorFiltro
    .mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveOldRequest = resolve;
      })
    )
    .mockResolvedValueOnce({
      data: [{ idProducto: "new", descrip: "Resultado nuevo", precio: 1 }],
    });

  const { rerender } = render(catalogue({ descrip: "old" }));
  await act(() => vi.advanceTimersByTimeAsync(500));
  rerender(catalogue({ descrip: "new" }));
  await act(() => vi.advanceTimersByTimeAsync(500));
  await act(async () =>
    resolveOldRequest({ data: [{ idProducto: "old", descrip: "Resultado anterior" }] })
  );

  expect(screen.getByText("Resultado nuevo")).toBeTruthy();
  expect(screen.queryByText("Resultado anterior")).toBeNull();
});

it("cancels the search when unmounted before the debounce ends", async () => {
  const { unmount } = render(catalogue());
  unmount();
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(productoApi.getProductosPorFiltro).not.toHaveBeenCalled();
});
