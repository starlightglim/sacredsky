'use client';

import {useEffect, useRef} from 'react';

export function ClientTextCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const duplicateContent = () => {
      // Clone the content to ensure seamless looping
      const contentWidth = carousel.scrollWidth;
      if (contentWidth < window.innerWidth * 2) {
        const clone = carousel.cloneNode(true);
        carousel.appendChild(clone.childNodes[0]);
      }
    };

    duplicateContent();
    window.addEventListener('resize', duplicateContent);

    return () => {
      window.removeEventListener('resize', duplicateContent);
    };
  }, []);

  const carouselItems = [
    'FREE STANDARD SHIPPING ON ORDERS OVER $200',
    'SUSTAINABLE FASHION',
    'HANDMADE WITH LOVE',
    'UNIQUE DESIGNS',
    'ETHICALLY SOURCED MATERIALS'
  ];

  return (
    <div className="text-carousel-container">
      <div ref={carouselRef} className="text-carousel animate-carousel">
        {carouselItems.map((item, i) => (
          <span key={i} className="text-carousel-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
} 