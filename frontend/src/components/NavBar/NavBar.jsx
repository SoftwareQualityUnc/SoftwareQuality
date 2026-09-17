import { Link } from "react-router-dom";

import CartWidget from "./CartWidget/CartWidget";
import SearchBar from "./SearchBar/SearchBar";

import logo from "../../assets/mvcLogo.png";
import "./NavBar.css";

export const NavBar = () => {
  return (
    <>
      <nav className="navContainer">
        <div>
          <Link to="/">
            <img
              className="navLogo"
              src={logo}
              alt="logo de la tienda de informatica"
            />
          </Link>
        </div>
          <SearchBar className="searchBar" />
        <div className="cartStyles">
          <Link to="/carrito">
            <CartWidget />
          </Link>
        </div>
      </nav>
    </>
  );
};
