import { useContext, useState, useEffect } from "react";
import { cartContext } from "../../../context/context";

function CartWidget() {
  const { cart } = useContext(cartContext);
  const [counterItem, setCounterItem] = useState(0);

  useEffect(() => {
    let a = 0;
    let newCart = [...cart];
    newCart.forEach((item) => {
      a = a + item.count;
    });
    setCounterItem(a);
  }, [cart]);

  return (
    <div>
      {counterItem}
      <button>🛒</button>
    </div>
  );
}

export default CartWidget;
