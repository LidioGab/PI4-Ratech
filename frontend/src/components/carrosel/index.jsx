import { useState } from "react";
import './index.css';

export default function Carousel({ children }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = children.length;

  const next = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  return (
    <div className="carousel-container">
      <button
        onClick={prev}
        className="carousel-button carousel-button-prev"
        aria-label="Anterior"
        disabled={total <= 1}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15L6 9L12 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="carousel-outer">
        <div
          className="carousel-inner"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`
          }}
        >
          {children.map((child, index) => (
            <div key={index} className="carousel-slide-wrapper">
              {child}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={next}
        className="carousel-button carousel-button-next"
        aria-label="Próximo"
        disabled={total <= 1}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3L12 9L6 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {total > 1 && (
        <div className="carousel-indicators">
          {Array.from({ length: total }).map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Ir para página ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
