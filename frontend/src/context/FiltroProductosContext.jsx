import React, { createContext, useState } from "react";

const FiltroProductosContext = createContext();

const FiltroProductosProvider = ({ children }) => {
  const [filtroProductos, setFiltroProductos] = useState({
    idCategoria: 0,
    idSubCategoria: 0,
    descrip: "",
  }); 

  return (
    <FiltroProductosContext.Provider
      value={{ filtroProductos, setFiltroProductos }}
    >
      {children}
    </FiltroProductosContext.Provider>
  );
};

export { FiltroProductosContext, FiltroProductosProvider };

