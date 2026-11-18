import { useContext, useState } from "react";
import { FiltroProductosContext } from "../../../context/FiltroProductosContext";
import "./SearchBar.css";

const SearchBar = () => {
  const { setFiltroProductos } = useContext(FiltroProductosContext);
  const [description, setDescription] = useState("");

  const searchProducts = (event) => {
    const nextDescription = event.target.value;
    setDescription(nextDescription);
    setFiltroProductos((previous) => ({
      ...previous,
      descrip: nextDescription,
    }));
  };

  return (
    <div className="product-search" role="search">
      <svg
        aria-hidden="true"
        className="product-search__icon"
        viewBox="0 0 24 24"
      >
        <path d="m21 21-4.35-4.35m2.35-5.15A7.5 7.5 0 1 1 4 11.5a7.5 7.5 0 0 1 15 0Z" />
      </svg>
      <input
        aria-label="Buscar productos"
        autoComplete="off"
        className="product-search__input"
        onChange={searchProducts}
        placeholder="Buscá componentes, marcas y periféricos"
        type="search"
        value={description}
      />
    </div>
  );
};

export default SearchBar;
