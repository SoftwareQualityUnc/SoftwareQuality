import React, { useContext, useState } from "react";
import { FiltroProductosContext } from "../../../context/FiltroProductosContext";
import "./SearchBar.css";

const SearchBar = () => {
  const { setFiltroProductos } = useContext(
    FiltroProductosContext
  );
  const [descrip, setDescrip] = useState(0);

  const buscaProducto = (event) => {
    setDescrip(event.target.value);
    setFiltroProductos((prevVal) => ({
      ...prevVal,
      descrip: descrip,
    }));
  };
  return (
    <>
      <div className="search-container">
        <input
          onKeyUp={(descrip) => buscaProducto(descrip)}
          type="text"
          className="search-bar"
          placeholder="Buscar productos..."
        />
      </div>
    </>
  );
};

export default SearchBar;
