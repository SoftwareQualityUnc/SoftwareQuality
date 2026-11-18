import Footer from "../Footer/Footer";
import { NavBar } from "../NavBar/NavBar";

import "./GlobalLayout.css";

const GlobalLayout = ({ children }) => {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <NavBar />
      <main className="site-shell__content" id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default GlobalLayout;
