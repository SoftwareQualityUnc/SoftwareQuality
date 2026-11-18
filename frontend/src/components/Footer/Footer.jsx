import "./Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__eyebrow">MVC Informática</p>
          <p className="site-footer__statement">
            Componentes confiables para llevar cada equipo más lejos.
          </p>
        </div>
        <div className="site-footer__meta">
          <p>Trabajo final de Ingeniería de Software</p>
          <p>Luciano Trachta · Tadeo Antonino · Ignacio Quintana · Juan Ferrero</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
