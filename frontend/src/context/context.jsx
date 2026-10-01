import { createContext, useState } from "react";

export const cartContext = createContext();

export default function CartContextProvider(props) {
  const [cart, setCart] = useState([]);

  function addItemCount(item) {
    setCart((previous) => {
      if (!previous.some((element) => element.id === item.id)) {
        return [...previous, { ...item }];
      }
      return previous.map((element) =>
        element.id === item.id
          ? { ...element, count: element.count + item.count }
          : element
      );
    });
  }

  const eliminarItem = (id) => {
    setCart((previous) => previous.filter((element) => element.id !== id));
  };

  const deleteCart = () => {
    setCart([]);
  };

  const precioTotal = () => {
    let total = 0;
    cart.forEach((e) => (total += e.count * e.price));
    return total;
  };

  return (
    <cartContext.Provider
      value={{ cart, addItemCount, eliminarItem, deleteCart, precioTotal }}
    >
      {props.children}
    </cartContext.Provider>
  );
}
