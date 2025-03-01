import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'Contexts/AppContext';
import FlipIcon from 'Svgs/FlipIcon';
import 'Styles/Main/CardDisplay.css';

const CardDisplay: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const { selectedCards, currentIndex, setFullscreenImage } = context;

  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const currentCard = selectedCards[currentIndex];

  return (
    <>
      <div className='card-display'>
        {currentCard.card.back && (
          <>
            <img
              src={currentCard.card.back.imgs.normal}
              alt={currentCard.card.back.name}
              className={`card-image-back ${isFlipped ? 'flipped' : ''}`}
              onClick={() =>
                isFlipped && currentCard.card.back
                  ? setFullscreenImage(currentCard.card.back.imgs.large)
                  : setIsFlipped(!isFlipped)
              }
            />
            <div
              className='flip-button'
              onClick={() => setIsFlipped(!isFlipped)}
              aria-label='Flip card'
            >
              <FlipIcon className='flip-icon' />
            </div>
          </>
        )}
        <img
          src={currentCard.card.front.imgs.normal}
          alt={currentCard.card.front.name}
          onClick={() =>
            isFlipped && currentCard.card.back
              ? setIsFlipped(!isFlipped)
              : setFullscreenImage(currentCard.card.front.imgs.large)
          }
          className={`card-image-front ${isFlipped ? 'flipped' : ''}`}
        />
      </div>
      <p className='card-name'>
        {isFlipped && currentCard.card.back
          ? currentCard.card.back.name
          : currentCard.card.front.name}
      </p>
    </>
  );
};

export default CardDisplay;
