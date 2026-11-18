import { useContext, useEffect, useState } from "react";

import categoriaApi from "../../../api/categoriaApi";
import subCategoriaApi from "../../../api/subCategoriaApi";
import { FiltroProductosContext } from "../../../context/FiltroProductosContext";
import "./FilterBar.css";

const ALL_FILTERS = "0";

const FilterBar = () => {
  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(ALL_FILTERS);
  const [selectedSubcategory, setSelectedSubcategory] = useState(ALL_FILTERS);
  const [loadState, setLoadState] = useState("loading");
  const { setFiltroProductos } = useContext(FiltroProductosContext);

  useEffect(() => {
    let active = true;

    Promise.all([categoriaApi.getAll(), subCategoriaApi.getAll()])
      .then(([categoryResponse, subcategoryResponse]) => {
        if (!active) {
          return;
        }
        setCategories(categoryResponse.data ?? []);
        setAllSubcategories(subcategoryResponse.data ?? []);
        setLoadState("ready");
      })
      .catch(() => {
        if (active) {
          setLoadState("error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const subcategories = allSubcategories.filter(
    (subcategory) =>
      selectedCategory === ALL_FILTERS || subcategory.idCategoria === selectedCategory
  );

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(ALL_FILTERS);
    setFiltroProductos((previous) => ({
      ...previous,
      idCategoria: categoryId === ALL_FILTERS ? null : categoryId,
      idSubCategoria: null,
    }));
  };

  const selectSubcategory = (subcategoryId) => {
    const matchingSubcategory = allSubcategories.find(
      (subcategory) => subcategory.idSubCategoria === subcategoryId
    );
    const categoryId =
      selectedCategory === ALL_FILTERS && matchingSubcategory
        ? matchingSubcategory.idCategoria
        : selectedCategory;

    if (matchingSubcategory && selectedCategory === ALL_FILTERS) {
      setSelectedCategory(matchingSubcategory.idCategoria);
    }
    setSelectedSubcategory(subcategoryId);
    setFiltroProductos((previous) => ({
      ...previous,
      idCategoria: categoryId === ALL_FILTERS ? null : categoryId,
      idSubCategoria: subcategoryId === ALL_FILTERS ? null : subcategoryId,
    }));
  };

  const resetFilters = () => {
    setSelectedCategory(ALL_FILTERS);
    setSelectedSubcategory(ALL_FILTERS);
    setFiltroProductos((previous) => ({
      ...previous,
      idCategoria: null,
      idSubCategoria: null,
    }));
  };

  return (
    <aside aria-label="Filtros de productos" className="catalog-filters">
      <div className="catalog-filters__heading">
        <div>
          <p className="catalog-filters__eyebrow">Refiná tu búsqueda</p>
          <h2>Comprá por componente</h2>
        </div>
        <button className="catalog-filters__reset" onClick={resetFilters} type="button">
          Restablecer
        </button>
      </div>

      <div className="catalog-filters__fields">
        <label className="catalog-filters__field" htmlFor="category-filter">
          <span>Categoría</span>
          <select
            disabled={loadState !== "ready"}
            id="category-filter"
            onChange={(event) => selectCategory(event.target.value)}
            value={selectedCategory}
          >
            <option value={ALL_FILTERS}>Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.idCategoria} value={category.idCategoria}>
                {category.descrip}
              </option>
            ))}
          </select>
        </label>

        <label className="catalog-filters__field" htmlFor="subcategory-filter">
          <span>Subcategoría</span>
          <select
            disabled={loadState !== "ready"}
            id="subcategory-filter"
            onChange={(event) => selectSubcategory(event.target.value)}
            value={selectedSubcategory}
          >
            <option value={ALL_FILTERS}>Todas las subcategorías</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.idSubCategoria} value={subcategory.idSubCategoria}>
                {subcategory.descrip}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loadState === "error" && (
        <p className="catalog-filters__error" role="alert">
          Los filtros no están disponibles temporalmente.
        </p>
      )}
    </aside>
  );
};

export default FilterBar;
