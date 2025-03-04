import React, { useContext, useState, useEffect, useRef } from 'react';
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
  const {
    cardData,
    selectedCards,
    setCurrentIndex,
    setUserGuess,
    scores,
    setScores,
    setRevealedRanks,
    finished,
    setFinished,
    setfullScreenImage,
  } = context;

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);
  const totalScore = scores.reduce((sum, score) => sum + score.diff, 0);

  useEffect(() => {
    if (!finished) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [finished]);

  useEffect(() => {
    if (cardData && cardData.length > 0) {
      const randomIndex = Math.floor(Math.random() * cardData.length);
      const artCropUrl = cardData[randomIndex].card.front.imgs.art_crop;
      setBackgroundImage(artCropUrl);
    }
  }, [cardData]);

  if (!finished) {
    return (
      <>
        <div className='page-container'>
          {backgroundImage && (
            <>
              <div
                className='background-img'
                style={{ backgroundImage: `url(${backgroundImage})` }}
              />
              <div className='background-overlay' />
            </>
          )}
          <div className='results-not-found shadow-glow'>
            <div className='results-not-found-header'>
              <div className='results-not-found-header-text-container'>
                <h1 className='results-not-found-header-text'>404: No Data</h1>
              </div>
              <div className='results-not-found-header-subtext-container'>
                <p className='results-not-found-header-subtext'>
                  There was no game session found.
                </p>
                <p className='results-not-found-header-subtext'>
                  Redirecting to homepage...
                </p>
              </div>
            </div>
            <div className='results-not-found-content-container'></div>
          </div>
        </div>
      </>
    );
  }

  const handleHome = () => {
    setCurrentIndex(0);
    setUserGuess(0);
    setScores([]);
    setRevealedRanks([]);
    setFinished(false);
  };

  return (
    <section className='results-container'>
      {backgroundImage && (
        <>
          <div
            className='background-img'
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className='background-overlay' />
        </>
      )}
      <div className='quiz-results' ref={resultsRef}>
        <header className='results-header'>
          <div className='results-header-top'>
            <div className='results-title-container'>
              <p className='results-score-label'>Final Score:</p>
              <p className='results-score'>{totalScore}</p>
            </div>
            <Link to='/' className='results-logo-img'>
              <img
                src={SaltLogo}
                alt='salt logo'
                className='results-salt-logo orange-glow'
              />
            </Link>
          </div>
          <div className='results-header-bottom'>
            <Link
              to='/'
              onClick={() => handleHome()}
              className='guess-button orange-glow'
            >
              Home
            </Link>
          </div>
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
                        Card Rank: {score.cardRank}
                      </p>
                      <p className='results-text-label'>
                        Your Guess: {score.guess}
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
