import React, { useContext, useEffect } from 'react';
import { AppContext } from 'Contexts/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import SaltLogo from 'Assets/Images/salt-logo.webp';
import 'Styles/Main/Postgame.css';

export interface ScoreDetail {
  cardRank: number;
  guess: number;
  diff: number;
}

const Postgame: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const { selectedCards, scores, finished, setfullScreenImage } = context;

  const navigate = useNavigate();

  const totalScore = scores.reduce((sum, score) => sum + score.diff, 0);

  useEffect(() => {
    if (!finished) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [finished]);

  if (!finished) {
    return (
      <div className='results-error'>
        <h2>No active game session found</h2>
        <p>Redirecting to homepage...</p>
      </div>
    );
  }

  return (
    <section className='page-containers'>
      <div className='quiz-results'>
        <header className='results-header'>
          <div className='results-title-container'>
            <p className='results-score-label'>Final Score:</p>
            <p className='results-score'>{totalScore}</p>
          </div>
          <Link to='/' className='results-logo-img'>
            <img src={SaltLogo} alt='salt logo' className='results-salt-logo' />
          </Link>
        </header>
        <div className='results-content'>
          {scores.map((score, index) => {
            const card = selectedCards[index];
            return (
              <div key={index} className='results-card'>
                <div className='results-image-container'>
                  <img
                    src={card.card.front.imgs.small}
                    alt={card.card.front.name}
                    style={{ width: '100px' }}
                    className='results-card-image'
                    onClick={() =>
                      setfullScreenImage(card.card.front.imgs.large)
                    }
                  />
                </div>
                <div className='results-content-container'>
                  <div className='results-card-name'>
                    {card.card.front.name}
                  </div>
                  <div className='results-score-content'>
                    <div className='results-guess-content'>
                      <p className='results-text-label'>
                        Your Guess: {score.guess}
                      </p>
                      <p className='results-text-label'>
                        Card Rank: {score.cardRank}
                      </p>
                    </div>
                    <div className='results-score-score-container'>
                      <p className='results-score-text-label'>Score:</p>
                      <div className='results-score-plus-container'>
                        <p className='results-score-plus'>+</p>
                        <p className='results-score-text'>{score.diff}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Postgame;
