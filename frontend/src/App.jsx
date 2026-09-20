import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router";

import Home from "./components/Home/Home";
import Cart from "./components/Cart/Cart";
import ItemDetailContainer from "./components/ItemDetail/ItemDetailContainer";

import CartContextProvider from "./context/context";

function App() {
  return (
    <CartContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/detalle/:id" element={<ItemDetailContainer />} />
        </Routes>
      </BrowserRouter>
    </CartContextProvider>
  );
}

export default App;
