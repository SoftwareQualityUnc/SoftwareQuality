import GlobalLayout from "../GlobalLayout/GlobalLayout";
import Carousel from "./Carousel/Carousel";
import FilterBar from "./FilterBar/FilterBar";
import ItemListContainer from "./ItemListContainer/ItemListContainer";

import img1 from "../../assets/carouselImg/carousel1.png";
import img2 from "../../assets/carouselImg/carousel2.png";
import img3 from "../../assets/carouselImg/carousel3.png";
import img4 from "../../assets/carouselImg/carousel4.png";
import img5 from "../../assets/carouselImg/carousel5.png";

import { FiltroProductosProvider } from "../../context/FiltroProductosContext";
import "./Home.css";

const Home = () => {
  const images = [img1, img2, img3, img4, img5];

  return (
    <FiltroProductosProvider>
      <GlobalLayout className="globalLayout">
        <div className="homeFlex">
          <div className="carousel">
            <Carousel images={images} />
          </div>
          <div className="containerFilterAndItems">
            <div className="filterBar">
              <FilterBar />
            </div>
            <div className="itemListContainer">
              <ItemListContainer />
            </div>
          </div>
        </div>
      </GlobalLayout>
    </FiltroProductosProvider>
  );
};

export default Home;
