import React from "react";
import { cartContext } from "../../../context/context";
import { useContext } from "react";
import "./CartItem.css";

const CartItem = ({ title, img, detail, price, ml, id }) => {
  const { eliminarItem } = useContext(cartContext);

  return (
    <div className="container">
      <div>
        <img src={img} alt={`Imagen de ${title || "producto"}`} />
      </div>
      <div>
        <h1>{title}</h1>
        <p>{detail}</p>
        <p>{ml}</p>
        <div>{price}</div>
      </div>
      <button
        aria-label={`Eliminar ${title || "producto"} del carrito`}
        onClick={() => eliminarItem(id)}
      >
        <span aria-hidden="true">🗑</span>
      </button>
    </div>
  );
};

export default CartItem;
