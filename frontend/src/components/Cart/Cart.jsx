import { cartContext } from "../../context/context";
import { useContext } from "react";
import { Link } from "react-router-dom";

import GlobalLayout from "../GlobalLayout/GlobalLayout";
import CartItem from "./CartItem/CartItem";

import "./Cart.css";

const Cart = () => {
  const { cart, precioTotal, deleteCart } = useContext(cartContext);

  return (
    <GlobalLayout>
      <div className="containerGrande">
        <div className="container">
          {cart.map((item, index) => (
            <CartItem
              key={index}
              title={item.title}
              id={item.id}
              count={item.count}
              img={item.img}
            />
          ))}
        </div>
        <div className="precio">
          <h3>Total a pagar:</h3>
          <h2>$ {precioTotal()}</h2>
        </div>
        <div className="container">
          <button onClick={deleteCart}>Vaciar carrito</button>
          <Link to="/checkout">
            <button>Finalizar Compra</button>
          </Link>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default Cart;
