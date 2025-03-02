import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'Contexts/AppContext';
import FlipIcon from 'Svgs/FlipIcon';
import 'Styles/Main/CardDisplay.css';

const CardDisplay: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const { selectedCards, currentIndex, shouldFlip, setfullScreenImage } =
    context;

  const [isMounted, setIsMounted] = useState(false);
  const [activeFace, setActiveFace] = useState<string>('front');
  const [flipDirection, setFlipDirection] = useState<string | null>(null);

  useEffect(() => {
    setActiveFace('front');
  }, [currentIndex]);

  useEffect(() => {
    setTimeout(() => {
      setFlipDirection(null);
    }, 300);
  }, [flipDirection, setFlipDirection]);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setIsMounted(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleFlip = () => {
    setFlipDirection(activeFace === 'front' ? 'flip' : 'unflip');
    setActiveFace((prev) => (prev === 'front' ? 'back' : 'front'));
    setTimeout(() => {
      setFlipDirection(null);
    }, 600);
  };

  const currentCard = selectedCards[currentIndex];

  return (
    <>
      <div className='card-display'>
        {currentCard.card.back && (
          <div
            className='flip-button'
            onClick={() => handleFlip()}
            aria-label='Flip card'
          >
            <FlipIcon className='flip-icon' />
          </div>
        )}
        <div
          className={`flip-container 
            ${isMounted ? 'animate-in' : ''}
            ${shouldFlip ? 'flip-transition' : ''}
            ${
              flipDirection === 'flip'
                ? 'flip-face'
                : flipDirection === 'unflip'
                ? 'unflip-face'
                : ''
            }
            ${flipDirection === 'unflip' ? 'unflip-end' : ''}
            `}
        >
          {currentCard.card.back && (
            <>
              <img
                src={currentCard.card.back.imgs.normal}
                alt={currentCard.card.back.name}
                className={`card-image-back ${
                  activeFace === 'back' ? 'flipped' : ''
                }`}
                onClick={() =>
                  activeFace === 'back' && currentCard.card.back
                    ? setfullScreenImage(currentCard.card.back.imgs.large)
                    : handleFlip()
                }
              />
            </>
          )}
          <img
            src={currentCard.card.front.imgs.normal}
            alt={currentCard.card.front.name}
            onClick={() =>
              activeFace === 'back' && currentCard.card.back
                ? handleFlip()
                : setfullScreenImage(currentCard.card.front.imgs.large)
            }
            className={`card-image-front ${
              activeFace === 'back' ? 'flipped' : ''
            }`}
          />
        </div>
      </div>
      <p className='card-name'>
        {activeFace === 'back' && currentCard.card.back
          ? currentCard.card.back.name
          : currentCard.card.front.name}
      </p>
    </>
  );
};

export default CardDisplay;
