// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";

import ItemList from "./ItemList";
import "./ItemListContainer.css";

//import getProducts from "../../mockAPI/mockAPI";

const producto1 = {
  titulo: "titulo1",
};
const producto2 = {
  titulo: "titulo2",
};
const producto3 = {
  titulo: "titulo3",
};
const producto4 = {
  titulo: "titulo4",
};

const productList = [producto1, producto2, producto3, producto4];

function ItemListContainer() {
  return (
    <>
      <div className="itemListContainerStyle">
        <ItemList productList={productList} />
      </div>
    </>
  );
}

export default ItemListContainer;
