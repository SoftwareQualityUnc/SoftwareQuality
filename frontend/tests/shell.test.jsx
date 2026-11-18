import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "../src/App";
import SearchBar from "../src/components/NavBar/SearchBar/SearchBar";
import { FiltroProductosContext } from "../src/context/FiltroProductosContext";
import categoriaApi from "../src/api/categoriaApi";
import productoApi from "../src/api/productoApi";
import subCategoriaApi from "../src/api/subCategoriaApi";

vi.mock("../src/api/categoriaApi", () => ({ default: { getAll: vi.fn() } }));
vi.mock("../src/api/productoApi", () => ({
  default: {
    getProducto: vi.fn(),
    getProductosPorFiltro: vi.fn(),
  },
}));
vi.mock("../src/api/subCategoriaApi", () => ({ default: { getAll: vi.fn() } }));

beforeEach(() => {
  categoriaApi.getAll.mockResolvedValue({ data: [] });
  subCategoriaApi.getAll.mockResolvedValue({ data: [] });
  productoApi.getProductosPorFiltro.mockResolvedValue({ data: [] });
  productoApi.getProducto.mockResolvedValue({
    data: {
      idProducto: "12345678901234567890",
      descrip: "Placa de video",
      precio: 500,
      cantStock: 3,
      linkImagen: "https://example.org/gpu.png",
    },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe.each(["/", "/carrito", "/detalle/12345678901234567890"])(
  "shared shell at %s",
  (route) => {
    it("renders accessible navigation, search, main content, and footer", () => {
      window.history.pushState({}, "", route);
      render(<App />);

      expect(screen.getByRole("navigation", { name: /navegación principal/i })).toBeTruthy();
      expect(screen.getByRole("searchbox", { name: /buscar productos/i })).toBeTruthy();
      expect(screen.getByRole("main")).toBeTruthy();
      expect(screen.getByRole("contentinfo")).toBeTruthy();
    });
  }
);

it("uses the current search input value when updating filters", async () => {
  const setFiltroProductos = vi.fn();
  const user = userEvent.setup();

  render(
    <FiltroProductosContext.Provider value={{ setFiltroProductos }}>
      <SearchBar />
    </FiltroProductosContext.Provider>
  );

  await user.type(screen.getByRole("searchbox", { name: /buscar productos/i }), "gpu");

  const latestUpdater = setFiltroProductos.mock.lastCall[0];
  expect(latestUpdater({ idCategoria: null, idSubCategoria: null, descrip: "" })).toEqual({
    idCategoria: null,
    idSubCategoria: null,
    descrip: "gpu",
  });
});
