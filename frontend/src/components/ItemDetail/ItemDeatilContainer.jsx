import { useState } from "react";
import { useParams } from "react-router-dom";

import GlobalLayout from "../GlobalLayout/GlobalLayout";
import ItemDetail from "./ItemDetail";

import "./ItemDetailContainer.css";

function ItemDetailContainer() {
  const [producto, setProducto] = useState([]);
  const { id } = useParams();
  const { img, title, detail, price, stock } = producto;

  return (
    <GlobalLayout>
      <div className="container">
        <ItemDetail
          id={id}
          img={img}
          title={title}
          detail={detail}
          price={price}
          stock={stock}
        />
      </div>
    </GlobalLayout>
  );
}

export default ItemDetailContainer;
