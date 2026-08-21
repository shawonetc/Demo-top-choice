'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './HeroBanner.module.css';

const slides = [
  { src: '/cover10.png', alt: 'Special Offer Banner' },
  { src: '/cover3.jpeg', alt: 'Second Cover Banner' },
];

const DRAG_THRESHOLD = 50; // px

const HeroBanner: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(next, 4000);
  }, [next]);

  useEffect(() => {
    resetAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [resetAutoPlay]);

  // --- Mouse drag ---
  const onMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setDragging(true);
    setDragOffset(0);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || startX.current === null) return;
    setDragOffset(e.clientX - startX.current);
  };

  const onMouseUp = () => {
    if (!dragging) return;
    if (dragOffset < -DRAG_THRESHOLD) next();
    else if (dragOffset > DRAG_THRESHOLD) prev();
    setDragging(false);
    setDragOffset(0);
    startX.current = null;
    resetAutoPlay();
  };

  const onMouseLeave = () => {
    if (dragging) {
      if (dragOffset < -DRAG_THRESHOLD) next();
      else if (dragOffset > DRAG_THRESHOLD) prev();
      setDragging(false);
      setDragOffset(0);
      startX.current = null;
      resetAutoPlay();
    }
  };

  // --- Touch swipe ---
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setDragging(true);
    setDragOffset(0);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    setDragOffset(e.touches[0].clientX - startX.current);
  };

  const onTouchEnd = () => {
    if (dragOffset < -DRAG_THRESHOLD) next();
    else if (dragOffset > DRAG_THRESHOLD) prev();
    setDragging(false);
    setDragOffset(0);
    startX.current = null;
    resetAutoPlay();
  };

  return (
    <div className={styles.bannerContainer}>
      <div
        className={`${styles.slider} ${dragging ? styles.dragging : ''}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`${styles.slide} ${i === current ? styles.active : styles.inactive}`}
            style={
              i === current && dragging
                ? { transform: `translateX(${dragOffset}px)`, transition: 'none' }
                : undefined
            }
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className={styles.bannerImage}
              draggable={false}
            />
          </div>
        ))}

        {/* Dots */}
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => { goTo(i); resetAutoPlay(); }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;