import GlobalLayout from "../GlobalLayout/GlobalLayout";
import Carousel from "./Carousel/Carousel";
import FilterBar from "./FilterBar/FilterBar";
import ItemListContainer from "./ItemListContainer/ItemListContainer";

import img1 from "../../assets/carouselImg/carousel1.png";
import img2 from "../../assets/carouselImg/carousel2.png";
import img3 from "../../assets/carouselImg/carousel3.png";
import img4 from "../../assets/carouselImg/carousel4.png";
import img5 from "../../assets/carouselImg/carousel5.png";

import "./Home.css";

const slides = [
  { src: img1, alt: "Oferta del mouse inalámbrico ASUS TUF Gaming M4" },
  { src: img2, alt: "Oferta destacada de hardware gamer" },
  { src: img3, alt: "Oferta de componentes de alto rendimiento" },
  { src: img4, alt: "Oferta de accesorios para equipos gamer" },
  { src: img5, alt: "Oferta de periféricos y componentes" },
];

const Home = () => {
  return (
    <GlobalLayout>
      <div className="storefront">
        <section className="storefront__intro">
          <div className="storefront__copy">
            <p className="storefront__eyebrow">Todo para tu próximo equipo</p>
            <h1>Potenciá tus ideas con hardware a la altura.</h1>
            <p>
              Encontrá componentes confiables, periféricos gamer y mejoras de rendimiento
              seleccionadas para quienes cuidan cada detalle.
            </p>
            <a className="storefront__cta" href="#catalog">
              Explorar componentes
            </a>
          </div>
          <div className="storefront__metrics" aria-label="Ventajas de la tienda">
            <div>
              <strong>Selección</strong>
              <span>Hardware confiable</span>
            </div>
            <div>
              <strong>Experiencia</strong>
              <span>Compra simple en cualquier pantalla</span>
            </div>
          </div>
        </section>

        <Carousel slides={slides} />

        <section className="storefront__catalog" id="catalog">
          <div className="storefront__filters">
            <FilterBar />
          </div>
          <div className="storefront__products">
            <ItemListContainer />
          </div>
        </section>
      </div>
    </GlobalLayout>
  );
};

export default Home;
