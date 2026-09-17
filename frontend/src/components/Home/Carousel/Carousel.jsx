import { useEffect, useState } from "react";

import "./Carousel.css";

const Carousel = ({ images }) => {

  useEffect(() => {
    setInterval(() => {
      goToNextSlide();
    }, 4000);
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div>
      <button onClick={goToPrevSlide}>⬅</button>
      <img src={images[currentIndex]} alt={`Slide ${currentIndex}`} />
      <button onClick={goToNextSlide}>➡</button>
    </div>
  );
};

export default Carousel;
