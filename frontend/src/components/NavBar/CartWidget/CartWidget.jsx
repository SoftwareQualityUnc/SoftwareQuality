import { useContext } from "react";
import { cartContext } from "../../../context/context";
import "./CartWidget.css";

function CartWidget() {
  const { cart } = useContext(cartContext);
  const itemCount = cart.reduce((total, item) => total + item.count, 0);

  return (
    <span className="cart-widget">
      <svg aria-hidden="true" className="cart-widget__icon" viewBox="0 0 24 24">
        <path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H7" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
      <span className="cart-widget__label">Carrito</span>
      <span
        aria-label={`${itemCount} ${itemCount === 1 ? "producto" : "productos"}`}
        className="cart-widget__count"
      >
        {itemCount}
      </span>
    </span>
  );
}

export default CartWidget;
