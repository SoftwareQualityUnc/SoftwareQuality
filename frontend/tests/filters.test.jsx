import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import categoriaApi from "../src/api/categoriaApi";
import subCategoriaApi from "../src/api/subCategoriaApi";
import FilterBar from "../src/components/Home/FilterBar/FilterBar";
import { FiltroProductosContext } from "../src/context/FiltroProductosContext";

vi.mock("../src/api/categoriaApi", () => ({ default: { getAll: vi.fn() } }));
vi.mock("../src/api/subCategoriaApi", () => ({ default: { getAll: vi.fn() } }));

beforeEach(() => {
  categoriaApi.getAll.mockResolvedValue({
    data: [{ idCategoria: "category-1", descrip: "Graphics" }],
  });
  subCategoriaApi.getAll.mockResolvedValue({
    data: [
      {
        idSubCategoria: "subcategory-1",
        idCategoria: "category-1",
        descrip: "Performance GPUs",
      },
    ],
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("exposes labelled filters and clears an incompatible subcategory", async () => {
  const setFiltroProductos = vi.fn();
  const user = userEvent.setup();
  render(
    <FiltroProductosContext.Provider value={{ setFiltroProductos }}>
      <FilterBar />
    </FiltroProductosContext.Provider>
  );

  const category = await screen.findByRole("combobox", { name: "Categoría" });
  expect(screen.getByRole("combobox", { name: "Subcategoría" })).toBeTruthy();
  await waitFor(() => expect(screen.getByRole("option", { name: "Graphics" })).toBeTruthy());

  await user.selectOptions(category, "category-1");

  const updater = setFiltroProductos.mock.lastCall[0];
  expect(
    updater({ idCategoria: null, idSubCategoria: "old-subcategory", descrip: "" })
  ).toEqual({
    idCategoria: "category-1",
    idSubCategoria: null,
    descrip: "",
  });
});
