// FilterBar.js
import React, { useContext, useEffect, useState } from "react";
import categoriaApi from "../../../api/categoriaApi";
import subCategoriaApi from "../../../api/subCategoriaApi";
import { FiltroProductosContext } from "../../../context/FiltroProductosContext";
import "./FilterBar.css";

const FilterBar = () => {
  const [subCategoriasOriginal, setSubCategoriasOriginal] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [idCategoriaSeleccionada, setIdCategoriaSeleccionada] = useState(0);
  const [subCategorias, setSubCategorias] = useState([]);
  const [idSubCategoriaseleccionada, setIdSubCategoriaseleccionada] =
    useState(0);
  const { filtroProductos, setFiltroProductos } = useContext(
    FiltroProductosContext
  );

  useEffect(() => {
    categoriaApi
      .getAll()
      .then((res) => {
        setCategorias(res.data);
      })
      .catch((error) => {
        console.error(error);
      });

    subCategoriaApi
      .getAll()
      .then((res) => {
        setSubCategoriasOriginal(res.data);
        setSubCategorias(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const seleccionaCategoria = (idCategoria) => {
    setIdCategoriaSeleccionada(idCategoria);
    const tmp = subCategoriasOriginal.filter(
      (s) => s.idCategoria === idCategoria || idCategoria == 0 || !idCategoria
    );
    setSubCategorias(tmp);
    setFiltroProductos((prevVal) => ({
      ...prevVal,
      idCategoria: idCategoria,
    }));
  };

  const seleccionaSubCategoria = (idSubCategoria) => {
    setIdSubCategoriaseleccionada(idSubCategoria);

    if (idCategoriaSeleccionada == 0 || !idCategoriaSeleccionada) {
      let idCategoria = subCategoriasOriginal.find(
        (x) => x.idSubCategoria === idSubCategoria
      ).idCategoria;
      setIdCategoriaSeleccionada(idCategoria);
      seleccionaCategoria(idCategoria);
      setFiltroProductos((prevVal) => ({
        ...prevVal,
        idCategoria: idCategoria,
      }));
    }
    setFiltroProductos((prevVal) => ({
      ...prevVal,
      idSubCategoria: idSubCategoria,
    }));
  };

  return (
    <div className="filterBar">
      <p className="filtersTitle">Seleccione sus preferencias</p>
      <select
        name="Categorías"
        className="selectorFiltro"
        id=""
        value={idCategoriaSeleccionada}
        onChange={(e) => seleccionaCategoria(e.target.value)}
      >
        <option value="" disabled>
          Selecciona una categoría
        </option>
        <option key={0} value={0} defaultValue={0}>
          Todas
        </option>
        {categorias.map((cat) => (
          <option key={cat.idCategoria} value={cat.idCategoria}>
            {cat.descrip}
          </option>
        ))}
      </select>
      <select
        name="SubCategorías"
        className="selectorFiltro"
        id=""
        onChange={(e) => seleccionaSubCategoria(e.target.value)}
      >
        <option value="" disabled>
          Selecciona una subcategoría
        </option>
        <option value={0} defaultValue={0}>
          Todas
        </option>
        {subCategorias.map((s) => (
          <option value={s.idSubCategoria} key={s.idSubCategoria}>
            {s.descrip}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
