import { Link } from "react-router-dom";

import CartWidget from "./CartWidget/CartWidget";
import SearchBar from "./SearchBar/SearchBar";

import logo from "../../assets/mvcLogo.png";
import "./NavBar.css";

export const NavBar = () => {
  return (
    <header className="site-header">
      <nav aria-label="Navegación principal" className="site-nav">
        <Link aria-label="Inicio de MVC Informática" className="site-nav__brand" to="/">
          <img className="site-nav__logo" src={logo} alt="MVC Informática" />
          <span className="site-nav__tagline">Hardware para cada proyecto</span>
        </Link>
        <div className="site-nav__search">
          <SearchBar />
        </div>
        <div className="site-nav__actions">
          <Link aria-label="Ver carrito de compras" className="site-nav__cart" to="/carrito">
            <CartWidget />
          </Link>
        </div>
      </nav>
    </header>
  );
};
