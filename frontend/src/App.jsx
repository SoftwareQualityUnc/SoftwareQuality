import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router";

import Home from "./components/Home/Home";
import Cart from "./components/Cart/Cart";
import ItemDetailContainer from "./components/ItemDetail/ItemDetailContainer";

import CartContextProvider from "./context/context";
import { FiltroProductosProvider } from "./context/FiltroProductosContext";

const isCanary = import.meta.env.VITE_APP_VERSION === "1.1.0";

function App() {
  return (
    <CartContextProvider>
      <FiltroProductosProvider>
        <BrowserRouter>
          <div className={isCanary ? "app-shell app-shell--canary" : "app-shell"}>
            {isCanary && (
              <div className="canary-banner" role="status">
                ESTÁS VIENDO LA VERSIÓN CANARY 1.1.0
              </div>
            )}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/detalle/:id" element={<ItemDetailContainer />} />
            </Routes>
          </div>
        </BrowserRouter>
      </FiltroProductosProvider>
    </CartContextProvider>
  );
}

export default App;
