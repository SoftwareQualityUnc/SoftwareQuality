import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import Carousel from "../src/components/Home/Carousel/Carousel";

const slides = [
  { src: "/one.png", alt: "Primera oferta de hardware" },
  { src: "/two.png", alt: "Segunda oferta de hardware" },
  { src: "/three.png", alt: "Tercera oferta de hardware" },
];

const originalMatchMedia = window.matchMedia;

function setReducedMotion(matches) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

beforeEach(() => {
  vi.useFakeTimers();
  setReducedMotion(false);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  window.matchMedia = originalMatchMedia;
});

it("provides labelled controls and keyboard-friendly slide dots", () => {
  render(<Carousel slides={slides} />);

  expect(screen.getByRole("region", { name: /hardware destacado/i })).toBeTruthy();
  expect(screen.getByRole("button", { name: /diapositiva anterior/i })).toBeTruthy();
  expect(screen.getByRole("button", { name: /diapositiva siguiente/i })).toBeTruthy();

  const secondDot = screen.getByRole("button", { name: /ir a la diapositiva 2/i });
  fireEvent.click(secondDot);
  expect(screen.getByRole("img", { name: "Segunda oferta de hardware" })).toBeTruthy();
  expect(secondDot.getAttribute("aria-current")).toBe("true");

  fireEvent.keyDown(screen.getByRole("region", { name: /hardware destacado/i }), {
    key: "ArrowRight",
  });
  expect(screen.getByRole("img", { name: "Tercera oferta de hardware" })).toBeTruthy();
});

it("pauses autoplay while hovered or focused and resumes afterwards", () => {
  render(<Carousel slides={slides} interval={4000} />);
  const carousel = screen.getByRole("region", { name: /hardware destacado/i });

  fireEvent.mouseEnter(carousel);
  act(() => vi.advanceTimersByTime(4000));
  expect(screen.getByRole("img", { name: "Primera oferta de hardware" })).toBeTruthy();

  fireEvent.mouseLeave(carousel);
  act(() => vi.advanceTimersByTime(4000));
  expect(screen.getByRole("img", { name: "Segunda oferta de hardware" })).toBeTruthy();

  fireEvent.focus(screen.getByRole("button", { name: /diapositiva siguiente/i }));
  act(() => vi.advanceTimersByTime(4000));
  expect(screen.getByRole("img", { name: "Segunda oferta de hardware" })).toBeTruthy();
});

it("prioritizes only the initial banner", () => {
  render(<Carousel slides={slides} />);
  const image = screen.getByRole("img", { name: "Primera oferta de hardware" });
  expect(image.getAttribute("loading")).toBe("eager");
});

it("disables autoplay when reduced motion is preferred", () => {
  setReducedMotion(true);
  render(<Carousel slides={slides} interval={4000} />);

  act(() => vi.advanceTimersByTime(8000));
  expect(screen.getByRole("img", { name: "Primera oferta de hardware" })).toBeTruthy();
});

it("lets users explicitly pause and resume rotation", () => {
  render(<Carousel slides={slides} interval={4000} />);

  const pauseControl = screen.getByRole("button", { name: "Pausar carrusel" });
  fireEvent.click(pauseControl);
  act(() => vi.advanceTimersByTime(4000));
  expect(screen.getByRole("img", { name: "Primera oferta de hardware" })).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Reanudar carrusel" }));
  act(() => vi.advanceTimersByTime(4000));
  expect(screen.getByRole("img", { name: "Segunda oferta de hardware" })).toBeTruthy();
});

it("keeps keyboard-resumed rotation paused until focus leaves", () => {
  render(<Carousel slides={slides} interval={4000} />);

  const pauseControl = screen.getByRole("button", { name: "Pausar carrusel" });
  fireEvent.focus(pauseControl);
  fireEvent.click(pauseControl);

  const resumeControl = screen.getByRole("button", { name: "Reanudar carrusel" });
  fireEvent.click(resumeControl);
  act(() => vi.advanceTimersByTime(4000));
  expect(screen.getByRole("img", { name: "Primera oferta de hardware" })).toBeTruthy();

  fireEvent.blur(resumeControl, { relatedTarget: null });
  act(() => vi.advanceTimersByTime(4000));
  expect(screen.getByRole("img", { name: "Segunda oferta de hardware" })).toBeTruthy();
});
