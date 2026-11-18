import { useContext, useEffect, useState } from "react";


import productoApi from "../../../api/productoApi";
import { FiltroProductosContext } from "../../../context/FiltroProductosContext";
import Card from "./Card/Card";
import "./ItemList.css";

function ItemList() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(false);
  const { filtroProductos } = useContext(FiltroProductosContext);
  useEffect(() => {
    let active = true;
    setError(false);
    const delayDebounceFn = setTimeout(() => {
      productoApi.getProductosPorFiltro(filtroProductos)
        .then((res) => {
          if (active) {
            setProductos(res.data);
          }
        })
        .catch(() => {
          if (active) {
            setProductos([]);
            setError(true);
          }
        });
    }, 500);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [filtroProductos]);

  return (
      <div className="itemListStyle">
        {error && <p role="alert">No se pudieron cargar los productos.</p>}
        {productos?.map((product) => {
            return (
              <Card
                key={product.idProducto}
                id={product?.idProducto}
                img={product?.linkImagen}
                title={product?.descrip}
                price={product?.precio}
              />
            );
          })}
      </div>
  );
}

export default ItemList;
