import React, { useEffect, useState } from 'react';

interface NedaxerSpinnerProps {
  isVisible: boolean;
  isPulling?: boolean;
  pullProgress?: number;
  onComplete?: () => void;
}

export function NedaxerSpinner({ isVisible, isPulling = false, pullProgress = 0, onComplete }: NedaxerSpinnerProps) {
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
    if (isVisible || isPulling) {
      setIsAnimating(true);
    } else {
      // Delay hiding to allow fade out animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isPulling, onComplete]);

  if (!isAnimating && !isVisible && !isPulling) return null;

  // Calculate spinner position based on pull progress
  const spinnerScale = isPulling ? Math.min(pullProgress * 1.2, 1) : 1;
  const spinnerOpacity = isPulling ? Math.min(pullProgress * 1.5, 1) : isVisible ? 1 : 0;
  const rotation = isPulling ? pullProgress * 180 : 0; // Rotate based on pull progress

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-start justify-center pt-20 transition-all duration-300 ${
        isVisible ? 'bg-white/80 backdrop-blur-sm' : 'bg-transparent'
      }`}
      style={{ 
        opacity: spinnerOpacity,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      <div 
        className="relative w-24 h-24 transition-transform duration-200"
        style={{ 
          transform: `scale(${spinnerScale})`,
        }}
      >
        {/* Spinning circle container */}
        <div 
          className={`absolute inset-0 transition-transform duration-200 ${
            isVisible ? 'animate-spin' : ''
          }`}
          style={{ 
            animationDuration: '2s',
            transform: `rotate(${rotation}deg)`
          }}
        >
          {letters.map((letter, index) => {
            const angle = (index * 360) / letters.length;
            const radius = 40; // Distance from center
            const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
            
            return (
              <div
                key={index}
                className="absolute w-6 h-6 flex items-center justify-center"
                style={{
                  left: `calc(50% + ${x}px - 12px)`,
                  top: `calc(50% + ${y}px - 12px)`,
                  transform: `rotate(${-angle - rotation}deg)`, // Counter-rotate to keep letters upright
                }}
              >
                <img
                  src={letter.src}
                  alt={letter.alt}
                  className={`w-5 h-5 object-contain transition-all duration-200 ${
                    isVisible ? 'animate-pulse' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transform: `scale(${isPulling ? Math.min(pullProgress + 0.5, 1.2) : 1})`
                  }}
                />
              </div>
            );
          })}
        </div>
        
        {/* Center logo/indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`w-3 h-3 bg-blue-500 rounded-full transition-all duration-300 ${
              isVisible ? 'animate-ping' : ''
            }`}
            style={{
              transform: `scale(${isPulling ? pullProgress : 1})`
            }}
          />
        </div>
      </div>
      
      {/* Loading text */}
      {isVisible && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2">
          <p className="text-gray-600 text-sm font-medium animate-pulse">
            Refreshing...
          </p>
        </div>
      )}
      
      {/* Pull indicator text */}
      {isPulling && !isVisible && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2">
          <p className="text-gray-500 text-xs font-medium">
            {pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
          </p>
        </div>
      )}
    </div>
  );
}