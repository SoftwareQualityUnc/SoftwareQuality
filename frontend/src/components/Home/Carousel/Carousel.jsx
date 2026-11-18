import { useCallback, useEffect, useState } from "react";

import "./Carousel.css";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const readReducedMotionPreference = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

const Carousel = ({ slides = [], interval = 6000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    readReducedMotionPreference
  );
  const slideCount = slides.length;
  const isPaused =
    isHovered || hasFocus || isManuallyPaused || prefersReducedMotion;

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = (event) => setPrefersReducedMotion(event.matches);
    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener?.("change", updatePreference);

    return () => mediaQuery.removeEventListener?.("change", updatePreference);
  }, []);

  const goToSlide = useCallback(
    (index) => {
      if (slideCount === 0) {
        return;
      }
      setCurrentIndex((index + slideCount) % slideCount);
    },
    [slideCount]
  );

  const goToNextSlide = useCallback(() => {
    setCurrentIndex((previous) => (previous + 1) % slideCount);
  }, [slideCount]);

  const goToPreviousSlide = useCallback(() => {
    setCurrentIndex((previous) => (previous - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (isPaused || slideCount < 2) {
      return undefined;
    }

    const intervalId = window.setInterval(goToNextSlide, interval);
    return () => window.clearInterval(intervalId);
  }, [goToNextSlide, interval, isPaused, slideCount]);

  if (slideCount === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPreviousSlide();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNextSlide();
    }
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHasFocus(false);
    }
  };

  const toggleRotation = () => {
    setIsManuallyPaused((paused) => !paused);
  };

  return (
    <section
      aria-label="Hardware destacado"
      aria-roledescription="carrusel"
      className="hero-carousel"
      onBlurCapture={handleBlur}
      onFocusCapture={() => setHasFocus(true)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
    >
      <div aria-live="polite" className="hero-carousel__viewport">
        <img
          alt={currentSlide.alt}
          className="hero-carousel__image"
          decoding="async"
          key={currentSlide.src}
          loading={currentIndex === 0 ? "eager" : "lazy"}
          src={currentSlide.src}
        />
      </div>

      <button
        aria-label="Diapositiva anterior"
        className="hero-carousel__control hero-carousel__control--previous"
        onClick={goToPreviousSlide}
        type="button"
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        aria-label="Diapositiva siguiente"
        className="hero-carousel__control hero-carousel__control--next"
        onClick={goToNextSlide}
        type="button"
      >
        <span aria-hidden="true">›</span>
      </button>

      <div aria-label="Elegir diapositiva destacada" className="hero-carousel__dots" role="group">
        {slides.map((slide, index) => (
          <button
            aria-current={index === currentIndex ? "true" : undefined}
            aria-label={`Ir a la diapositiva ${index + 1}: ${slide.alt}`}
            className="hero-carousel__dot"
            key={slide.src}
            onClick={() => goToSlide(index)}
            type="button"
          />
        ))}
      </div>
      <button
        aria-label={
          prefersReducedMotion
            ? "Reproducción automática desactivada por la preferencia de movimiento reducido"
            : isManuallyPaused
              ? "Reanudar carrusel"
              : "Pausar carrusel"
        }
        aria-pressed={isManuallyPaused}
        className="hero-carousel__toggle"
        disabled={prefersReducedMotion}
        onClick={toggleRotation}
        type="button"
      >
        <span aria-hidden="true">{isManuallyPaused ? "▶" : "Ⅱ"}</span>
        <span>
          {prefersReducedMotion
            ? "Movimiento reducido"
            : isManuallyPaused
              ? "Reanudar"
              : "Pausar"}
        </span>
      </button>
      <span className="hero-carousel__hint">Usá las flechas para explorar</span>
    </section>
  );
};

export default Carousel;
