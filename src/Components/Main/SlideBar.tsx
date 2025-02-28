// src/Components/Utils/SlideBar.tsx
import React, { useContext, useRef, useState } from 'react';
import { AppContext } from 'Contexts/AppContext';
import 'Styles/Main/SlideBar.css';

const SlideBar: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const { userGuess, setUserGuess } = context;

  const [dragging, setDragging] = useState(false);

  // Convert userGuess from string to number, default to 0 if empty
  const guessValue = parseInt(userGuess || '0', 10);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate dashes 0..100
  const dashes = Array.from({ length: 101 }, (_, i) => i);

  // Convert guessValue to a fraction for the thumb position
  const fraction = guessValue / 100;
  const thumbBottom = fraction * 100;

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    updateGuessFromPointer(e.clientY);
  };

  const handleClickContainer = (e: React.MouseEvent) => {
    if (dragging || !containerRef.current) return;
    updateGuessFromPointer(e.clientY);
  };

  const updateGuessFromPointer = (clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const containerHeight = rect.height;

    const offsetY = clientY - rect.top;
    const clamped = Math.max(0, Math.min(containerHeight, offsetY));

    // Compute the fraction from the top, then invert it so that 0 is at the bottom.
    const fraction = clamped / containerHeight;
    const newGuess = Math.round((1 - fraction) * 100);

    setUserGuess(String(newGuess));
  };

  return (
    <div
      className='slidebar-container'
      ref={containerRef}
      onClick={handleClickContainer}
    >
      <div className='dashes'>
        {dashes.map((num) => (
          <div key={num} className='dash'>
            {num % 10 === 0 ? <span className='dash-label'>{num}</span> : '-'}
          </div>
        ))}
      </div>
      <div
        className='thumb'
        style={{ bottom: `${thumbBottom}%` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
};

export default SlideBar;
