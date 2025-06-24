import React, { useEffect, useState } from 'react';

interface NedaxerSpinnerProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function NedaxerSpinner({ isVisible, onComplete }: NedaxerSpinnerProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const letters = [
    { src: '/images/letter-n.png', alt: 'N' },
    { src: '/images/letter-e1.png', alt: 'E' },
    { src: '/images/letter-d.png', alt: 'D' },
    { src: '/images/letter-a.png', alt: 'A' },
    { src: '/images/letter-x.png', alt: 'X' },
    { src: '/images/letter-e2.png', alt: 'E' },
    { src: '/images/letter-r.png', alt: 'R' }
  ];

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      // Delay hiding to allow fade out animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isAnimating && !isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative w-32 h-32">
        {/* Spinning circle container */}
        <div 
          className={`absolute inset-0 animate-spin ${isVisible ? 'animate-spin' : ''}`}
          style={{ animationDuration: '2s' }}
        >
          {letters.map((letter, index) => {
            const angle = (index * 360) / letters.length;
            const radius = 50; // Distance from center
            const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
            
            return (
              <div
                key={index}
                className="absolute w-8 h-8 flex items-center justify-center"
                style={{
                  left: `calc(50% + ${x}px - 16px)`,
                  top: `calc(50% + ${y}px - 16px)`,
                  transform: `rotate(${-angle}deg)`, // Counter-rotate to keep letters upright
                }}
              >
                <img
                  src={letter.src}
                  alt={letter.alt}
                  className={`w-6 h-6 object-contain transition-transform duration-200 ${
                    isVisible ? 'animate-pulse scale-110' : 'scale-100'
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
              </div>
            );
          })}
        </div>
        
        {/* Center logo/indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-4 h-4 bg-blue-500 rounded-full transition-transform duration-300 ${
            isVisible ? 'animate-ping' : ''
          }`} />
        </div>
      </div>
      
      {/* Loading text */}
      <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}