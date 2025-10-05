import { useState } from "react";

export default function Carousel({ children }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = children.length;
  const carouselWidth = 1200;

  const next = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  return (
    <div className="carousel-outer" style={{ width: `${carouselWidth}px`, margin: '0 auto', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      <button
        onClick={prev}
        style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: '#fff',
          color: '#444',
          border: '1px solid #ddd',
          borderRadius: '50%',
          width: 36,
          height: 36,
          fontSize: 20,
          zIndex: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, color 0.2s',
        }}
        aria-label="Anterior"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15L6 9L12 3" stroke="#444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div
        className="carousel-inner"
        style={{
          display: 'flex',
          transition: 'transform 0.5s',
          transform: `translateX(-${currentIndex * carouselWidth}px)`
        }}
      >
        {children.map((child, index) => (
          <div key={index} style={{ width: `${carouselWidth}px`, flexShrink: 0, overflow: 'hidden', display: 'flex', justifyContent: 'space-between' }}>
            {child}
          </div>
        ))}
      </div>
      <button
        onClick={next}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: '#fff',
          color: '#444',
          border: '1px solid #ddd',
          borderRadius: '50%',
          width: 36,
          height: 36,
          fontSize: 20,
          zIndex: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, color 0.2s',
        }}
        aria-label="Próximo"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3L12 9L6 15" stroke="#444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
