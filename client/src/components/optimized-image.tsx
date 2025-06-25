import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

interface ImageFormats {
  avif?: string;
  webp?: string;
  optimized: string;
  original: string;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes,
  placeholder = 'blur',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageFormats, setImageFormats] = useState<ImageFormats | null>(null);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [priority, isInView]);

  // Fetch optimized image formats
  useEffect(() => {
    if (!isInView) return;

    const fetchOptimizedFormats = async () => {
      try {
        const response = await fetch(`/api/images/optimize?src=${encodeURIComponent(src)}`);
        if (response.ok) {
          const formats = await response.json();
          setImageFormats(formats);
        } else {
          // Fallback to original if optimization API fails
          setImageFormats({
            optimized: src,
            original: src
          });
        }
      } catch (error) {
        console.warn('Failed to fetch optimized image formats:', error);
        setImageFormats({
          optimized: src,
          original: src
        });
      }
    };

    fetchOptimizedFormats();
  }, [src, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate srcSet for different formats
  const generateSources = () => {
    if (!imageFormats) return [];

    const sources = [];

    if (imageFormats.avif) {
      sources.push(
        <source
          key="avif"
          srcSet={imageFormats.avif}
          type="image/avif"
          sizes={sizes}
        />
      );
    }

    if (imageFormats.webp) {
      sources.push(
        <source
          key="webp"
          srcSet={imageFormats.webp}
          type="image/webp"
          sizes={sizes}
        />
      );
    }

    return sources;
  };

  // Placeholder styles
  const placeholderStyles = placeholder === 'blur' 
    ? 'bg-gray-200 animate-pulse blur-sm' 
    : 'bg-gray-100';

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={`absolute inset-0 ${placeholderStyles} flex items-center justify-center`}
          style={{ width, height }}
        >
          {placeholder === 'blur' && (
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* Optimized Image */}
      {isInView && imageFormats && !hasError && (
        <picture>
          {generateSources()}
          <img
            ref={imgRef}
            src={imageFormats.optimized}
            alt={alt}
            width={width}
            height={height}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        </picture>
      )}

      {/* Error fallback */}
      {hasError && (
        <div
          className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400"
          style={{ width, height }}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Preload critical images
export function preloadImage(src: string, priority: boolean = false) {
  const link = document.createElement('link');
  link.rel = priority ? 'preload' : 'prefetch';
  link.href = src;
  link.as = 'image';
  
  // Add WebP support detection
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  if (supportsWebP) {
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    link.href = webpSrc;
  }
  
  document.head.appendChild(link);
  return link;
}

// Hook for preloading multiple images
export function useImagePreloader(images: string[], priority: boolean = false) {
  useEffect(() => {
    const links = images.map(src => preloadImage(src, priority));
    
    return () => {
      links.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [images, priority]);
}