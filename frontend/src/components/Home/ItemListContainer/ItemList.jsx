import { useContext, useEffect, useState } from "react";


//import filtroProductosContext from "../../../context/FiltroProductosContext";
import productoApi from "../../../api/productoApi";
import { FiltroProductosContext } from "../../../context/FiltroProductosContext";
import Card from "./Card/Card";
import "./ItemList.css";

function ItemList(data) {
  const [productos, setProductos] = useState([]);
  const { filtroProductos } = useContext(FiltroProductosContext);
  // useEffect(() => {
  //   if (data?.productList) {
  //     setDrinkList(data?.productList);
  //   }

  //   //console.log(filtroProductos);
  // }, [data]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        console.log("Filtros actualizados:", filtroProductos);
        productoApi.getProductosPorFiltro(filtroProductos).then(res => {
            console.log(res);
            setProductos(res.data);
        });
    }, 500);

    // Limpia el timeout si filtroProductos cambia antes de que pase el retraso
    return () => clearTimeout(delayDebounceFn);
}, [filtroProductos]);

  return (
    <>
      <div className="itemListStyle">
        {productos?.length &&
          productos?.map((product, index) => {
            return (
              <Card
                key={index}
                id={product?.idProducto}
                img={product?.linkImagen}
                title={product?.descrip}
                price={product?.precio}
              />
            );
          })}
      </div>
    </>
  );
}

export default ItemList;
