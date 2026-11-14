import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import GlobalLayout from "../GlobalLayout/GlobalLayout";
import ItemDetail from "./ItemDetail";
import productoApi from "../../api/productoApi";

import "./ItemDetailContainer.css";

function ItemDetailContainer() {
  const [producto, setProducto] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    productoApi
      .getProducto(id)
      .then((response) => setProducto(response.data))
      .catch((error) => console.error(error));
  }, [id]);

  if (!producto) {
    return <GlobalLayout />;
  }

  const { linkImagen, descrip, precio, cantStock } = producto;

  return (
    <GlobalLayout>
      <div className="container">
        <ItemDetail
          id={id}
          img={linkImagen}
          title={descrip}
          detail={descrip}
          price={precio}
          stock={cantStock}
        />
      </div>
    </GlobalLayout>
  );
}

export default ItemDetailContainer;
