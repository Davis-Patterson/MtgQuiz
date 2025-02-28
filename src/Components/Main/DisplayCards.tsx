// src/Components/DisplayCards.tsx
import React, { useContext } from 'react';
import { AppContext, Card } from 'Contexts/AppContext';
import 'Styles/Main/DisplayCards.css';

const DisplayCards: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context');
  }
  const { cardData } = context;

  const validCards = cardData.filter(
    (card: Card) => card.rank !== null && card.salt_score !== null
  );

  return (
    <div className='cards-grid'>
      {validCards.map((card: Card) => (
        <div key={card.rank as number} className='card'>
          <img
            src={card.card.front.imgs.normal}
            alt={card.card.front.name}
            className='card-image'
          />
          <div className='card-info'>
            <h3 className='card-name'>{card.card.front.name}</h3>
            <p className='card-rank'>Rank: {card.rank}</p>
            <p className='card-salt'>Salt Score: {card.salt_score}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayCards;
