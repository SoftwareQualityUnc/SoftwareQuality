import React from "react";
import { cartContext } from "../../../context/context";
import { useContext } from "react";
import "./CartItem.css";

const CartItem = ({ title, img, detail, price, ml, id }) => {
  const { eliminarItem } = useContext(cartContext);

  return (
    <div className="container">
      <div>
        <img src={img} alt="imagen" />
      </div>
      <div>
        <h1>{title}</h1>
        <p>{detail}</p>
        <p>{ml}</p>
        <div>{price}</div>
      </div>
      <button onClick={() => eliminarItem(id)}>🗑</button>
    </div>
  );
};

export default CartItem;
