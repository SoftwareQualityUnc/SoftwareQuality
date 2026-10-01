import { act, cleanup, renderHook } from "@testing-library/react";
import { useContext } from "react";
import { afterEach, describe, expect, it } from "vitest";
import CartContextProvider, { cartContext } from "../src/context/context";

afterEach(cleanup);

function renderCart() {
  return renderHook(function useCart() {
    return useContext(cartContext);
  }, { wrapper: CartContextProvider });
}

describe("carrito", () => {
  it("empieza vacío y calcula un total cero", () => {
    const { result } = renderCart();
    expect(result.current.cart).toEqual([]);
    expect(result.current.precioTotal()).toBe(0);
  });

  it("conserva dos altas realizadas en el mismo evento", () => {
    const { result } = renderCart();
    act(() => {
      result.current.addItemCount({ id: "a", price: 10, count: 2 });
      result.current.addItemCount({ id: "b", price: 5, count: 1 });
    });
    expect(result.current.cart).toHaveLength(2);
    expect(result.current.precioTotal()).toBe(25);
  });

  it("acumula unidades sin modificar el producto ni el estado anterior", () => {
    const { result } = renderCart();
    const product = Object.freeze({ id: "a", price: 10, count: 1 });
    act(() => result.current.addItemCount(product));
    const previousCart = result.current.cart;
    act(() => result.current.addItemCount({ ...product, count: 2 }));
    expect(previousCart[0].count).toBe(1);
    expect(product.count).toBe(1);
    expect(result.current.cart[0].count).toBe(3);
    expect(result.current.precioTotal()).toBe(30);
  });

  it("elimina un producto y permite vaciar el carrito", () => {
    const { result } = renderCart();
    act(() => {
      result.current.addItemCount({ id: "a", price: 10, count: 1 });
      result.current.addItemCount({ id: "b", price: 5, count: 2 });
    });
    act(() => result.current.eliminarItem("a"));
    expect(result.current.cart.map((item) => item.id)).toEqual(["b"]);
    expect(result.current.precioTotal()).toBe(10);
    act(() => result.current.deleteCart());
    expect(result.current.cart).toEqual([]);
  });
});
