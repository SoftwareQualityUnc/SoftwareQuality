import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ItemList from "../src/components/Home/ItemListContainer/ItemList";
import { FiltroProductosContext } from "../src/context/FiltroProductosContext";
import productoApi from "../src/api/productoApi";

vi.mock("../src/api/productoApi", () => ({ default: { getProductosPorFiltro: vi.fn() } }));

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

it("no muestra un cero cuando el catálogo está vacío", async () => {
  productoApi.getProductosPorFiltro.mockResolvedValue({ data: [] });
  const { container } = render(catalogue());
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(container.textContent).toBe("");
});

it("muestra el producto recibido y el enlace a su detalle", async () => {
  productoApi.getProductosPorFiltro.mockResolvedValue({
    data: [{ idProducto: "p1", descrip: "Teclado", precio: 100 }],
  });
  render(catalogue({ descrip: "teclado" }));
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(screen.getByText("Teclado")).toBeTruthy();
  expect(screen.getByRole("link").getAttribute("href")).toBe("/detalle/p1");
  expect(productoApi.getProductosPorFiltro).toHaveBeenCalledWith({ descrip: "teclado" });
});

it("informa un error de carga sin volcar datos internos", async () => {
  productoApi.getProductosPorFiltro.mockRejectedValue(new Error("private server diagnostic"));
  render(catalogue());
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(screen.getByRole("alert").textContent).toBe("No se pudieron cargar los productos.");
  expect(screen.queryByText("private server diagnostic")).toBeNull();
});

it("ignora una respuesta vieja cuando ya cambiaron los filtros", async () => {
  let resolveOldRequest;
  productoApi.getProductosPorFiltro
    .mockImplementationOnce(() => new Promise((resolve) => { resolveOldRequest = resolve; }))
    .mockResolvedValueOnce({ data: [{ idProducto: "new", descrip: "Nuevo", precio: 1 }] });
  const { rerender } = render(catalogue({ descrip: "anterior" }));
  await act(() => vi.advanceTimersByTimeAsync(500));
  rerender(catalogue({ descrip: "nuevo" }));
  await act(() => vi.advanceTimersByTimeAsync(500));
  await act(async () => resolveOldRequest({ data: [{ idProducto: "old", descrip: "Viejo" }] }));
  expect(screen.getByText("Nuevo")).toBeTruthy();
  expect(screen.queryByText("Viejo")).toBeNull();
});

it("cancela la búsqueda si el componente se desmonta antes de 500 ms", async () => {
  const { unmount } = render(catalogue());
  unmount();
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(productoApi.getProductosPorFiltro).not.toHaveBeenCalled();
});
