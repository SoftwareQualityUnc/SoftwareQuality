import { useContext, useEffect, useState } from "react";

import productoApi from "../../../api/productoApi";
import { FiltroProductosContext } from "../../../context/FiltroProductosContext";
import Card from "./Card/Card";
import "./ItemList.css";

function ItemList() {
  const [products, setProducts] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const { filtroProductos } = useContext(FiltroProductosContext);

  useEffect(() => {
    let active = true;
    setLoadState("loading");

    const debounceId = window.setTimeout(() => {
      productoApi
        .getProductosPorFiltro(filtroProductos)
        .then((response) => {
          if (active) {
            setProducts(Array.isArray(response.data) ? response.data : []);
            setLoadState("success");
          }
        })
        .catch(() => {
          if (active) {
            setProducts([]);
            setLoadState("error");
          }
        });
    }, 500);

    return () => {
      active = false;
      window.clearTimeout(debounceId);
    };
  }, [filtroProductos]);

  if (loadState === "loading") {
    return (
      <div aria-live="polite" className="catalog-state" role="status">
        <span className="catalog-state__eyebrow">Preparando el catálogo</span>
        <strong>Cargando productos...</strong>
        <div aria-hidden="true" className="catalog-skeletons">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="catalog-state catalog-state--error" role="alert">
        <span className="catalog-state__eyebrow">Conexión interrumpida</span>
        <strong>No pudimos cargar los productos.</strong>
        <p>Intentá nuevamente en unos instantes.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="catalog-state" role="status">
        <span className="catalog-state__eyebrow">Sin coincidencias</span>
        <strong>No encontramos productos.</strong>
        <p>Probá con una búsqueda más amplia o restablecé los filtros.</p>
      </div>
    );
  }

  return (
    <div aria-label="Catálogo de productos" className="product-grid">
      {products.map((product) => (
        <Card
          id={product.idProducto}
          img={product.linkImagen}
          inStock={product.conStock ?? product.cantStock > 0}
          key={product.idProducto}
          price={product.precio}
          stock={product.cantStock}
          title={product.descrip}
        />
      ))}
    </div>
  );
}

export default ItemList;
