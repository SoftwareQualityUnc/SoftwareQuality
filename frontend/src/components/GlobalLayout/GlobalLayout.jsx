import Footer from "../Footer/Footer";
import { NavBar } from "../NavBar/NavBar";

import "./GlobalLayout.css";

const GlobalLayout = ({ children }) => {
  return (
      <div className="globalLayout">
        <NavBar />
        <div className="content">{children}</div>
        <Footer />
      </div>
  );
};

export default GlobalLayout;
