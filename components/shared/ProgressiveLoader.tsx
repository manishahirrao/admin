'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * Progressive loading component
 * Loads content in priority order with loading states
 */

interface LoadingPriority {
  critical: React.ReactNode;
  high: React.ReactNode;
  medium: React.ReactNode;
  low: React.ReactNode;
}

interface ProgressiveLoaderProps {
  content: Partial<LoadingPriority>;
  delay?: {
    high?: number;
    medium?: number;
    low?: number;
  };
}

export function ProgressiveLoader({
  content,
  delay = { high: 100, medium: 300, low: 500 },
}: ProgressiveLoaderProps) {
  const [loadedLevels, setLoadedLevels] = useState({
    critical: true,
    high: false,
    medium: false,
    low: false,
  });

  useEffect(() => {
    // Load high priority content
    const highTimer = setTimeout(() => {
      setLoadedLevels((prev) => ({ ...prev, high: true }));
    }, delay.high);

    // Load medium priority content
    const mediumTimer = setTimeout(() => {
      setLoadedLevels((prev) => ({ ...prev, medium: true }));
    }, delay.medium);

    // Load low priority content
    const lowTimer = setTimeout(() => {
      setLoadedLevels((prev) => ({ ...prev, low: true }));
    }, delay.low);

    return () => {
      clearTimeout(highTimer);
      clearTimeout(mediumTimer);
      clearTimeout(lowTimer);
    };
  }, [delay]);

  return (
    <div className="space-y-4">
      {/* Critical content - loads immediately */}
      {content.critical}

      {/* High priority content */}
      {loadedLevels.high ? (
        content.high
      ) : (
        <div className="animate-pulse bg-gray-200 rounded-lg h-32" />
      )}

      {/* Medium priority content */}
      {loadedLevels.medium ? (
        content.medium
      ) : (
        <div className="animate-pulse bg-gray-200 rounded-lg h-48" />
      )}

      {/* Low priority content */}
      {loadedLevels.low ? (
        content.low
      ) : (
        <div className="animate-pulse bg-gray-200 rounded-lg h-64" />
      )}
    </div>
  );
}

/**
 * Intersection Observer based lazy loading
 * Loads content when it enters viewport
 */
interface LazyLoadOnScrollProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function LazyLoadOnScroll({
  children,
  placeholder,
  rootMargin = '100px',
  threshold = 0.1,
}: LazyLoadOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref}>
      {isVisible ? (
        children
      ) : (
        placeholder || (
          <div className="animate-pulse bg-gray-200 rounded-lg h-64" />
        )
      )}
    </div>
  );
}

/**
 * Skeleton loader for different content types
 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-200"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 border-t border-gray-200"></div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

/**
 * Progressive image loading
 */
interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export function ProgressiveImage({
  src,
  alt,
  className = '',
  placeholder,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className="relative">
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoaded ? '' : 'blur-sm'} transition-all duration-300`}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Chunked data loader
 * Loads large datasets in chunks
 */
interface ChunkedLoaderProps<T> {
  data: T[];
  chunkSize?: number;
  renderChunk: (chunk: T[], index: number) => React.ReactNode;
  loadingIndicator?: React.ReactNode;
}

export function ChunkedLoader<T>({
  data,
  chunkSize = 50,
  renderChunk,
  loadingIndicator,
}: ChunkedLoaderProps<T>) {
  const [loadedChunks, setLoadedChunks] = useState(1);
  const totalChunks = Math.ceil(data.length / chunkSize);

  useEffect(() => {
    if (loadedChunks < totalChunks) {
      const timer = setTimeout(() => {
        setLoadedChunks((prev) => prev + 1);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loadedChunks, totalChunks]);

  const chunks = [];
  for (let i = 0; i < loadedChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, data.length);
    chunks.push(data.slice(start, end));
  }

  return (
    <div>
      {chunks.map((chunk, index) => (
        <div key={index}>{renderChunk(chunk, index)}</div>
      ))}
      {loadedChunks < totalChunks && (
        loadingIndicator || (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          </div>
        )
      )}
    </div>
  );
}
