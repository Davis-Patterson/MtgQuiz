import React from 'react';
import { Card } from 'Contexts/AppContext';

export interface ScoreDetail {
  cardRank: number;
  guess: number;
  diff: number;
}

interface PostgameProps {
  scores: ScoreDetail[];
  selectedCards: Card[];
}

const Postgame: React.FC<PostgameProps> = ({ scores, selectedCards }) => {
  const totalScore = scores.reduce((sum, score) => sum + score.diff, 0);

  return (
    <div className='quiz-results'>
      <h2>Quiz Finished!</h2>
      <p>Your total score (sum of differences): {totalScore}</p>
      <ul>
        {scores.map((score, index) => {
          const card = selectedCards[index];
          return (
            <li key={index} style={{ marginBottom: '20px' }}>
              <div>
                <img
                  src={card.card.front.imgs.normal}
                  alt={card.card.front.name}
                  style={{ width: '100px' }}
                />
              </div>
              <div>
                <strong>{card.card.front.name}</strong>
              </div>
              <div>
                Your Guess: {score.guess} | Actual Rank: {score.cardRank} |
                Difference: {score.diff}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Postgame;
