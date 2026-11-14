import { useCallback, useEffect, useState } from "react";

import "./Carousel.css";

const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  useEffect(() => {
    const intervalId = setInterval(goToNextSlide, 4000);
    return () => clearInterval(intervalId);
  }, [goToNextSlide]);

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
