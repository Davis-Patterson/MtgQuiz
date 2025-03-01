// src/Components/Main/Quiz.tsx
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'Contexts/AppContext';
import SlideBar from 'Components/Main/SlideBar';
import Postgame from 'Components/Main/Postgame';
import 'Styles/Main/Quiz.css';

const Quiz: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {
    cardData,
    selectedCards,
    setSelectedCards,
    currentIndex,
    setCurrentIndex,
    userGuess,
    setUserGuess,
    scores,
    setScores,
    finished,
    setFinished,
    started,
    setStarted,
    setCanScroll,
    setIsLoading,
  } = context;

  const [isSubmitted, setIsSubmitted] = useState(false);

  const startGame = () => {
    const validCards = cardData.filter(
      (card) => card.rank !== null && card.salt_score !== null
    );
    const shuffled = [...validCards].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    setSelectedCards(selected);
    setCurrentIndex(0);
    setUserGuess(0);
    setScores([]);
    setFinished(false);
    setStarted(true);
  };

  useEffect(() => {
    if (!started) {
      startGame();
    }
  }, [started]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
      alert('Please enter a valid number between 1 and 100.');
      return;
    }

    const currentCard = selectedCards[currentIndex];
    const cardRank = currentCard.rank as number;
    const diff = Math.abs(cardRank - userGuess);

    setScores([...scores, { cardRank, guess: userGuess, diff }]);
    setIsSubmitted(true);
    setCanScroll(false);
  };

  const handleNext = () => {
    setUserGuess(0);
    setIsSubmitted(false);
    setCanScroll(true);

    if (currentIndex < selectedCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setFinished(true);
      }, 300);
    }
  };

  if (selectedCards.length === 0) {
    return <div>Loading quiz data...</div>;
  }

  if (finished) {
    return <Postgame scores={scores} selectedCards={selectedCards} />;
  }

  const currentCard = selectedCards[currentIndex];

  return (
    <>
      <div className='page-container'>
        <div className='quiz-container'>
          <SlideBar />
          <div className='quiz-content'>
            <p className='card-count'>
              Card {currentIndex + 1} of {selectedCards.length}
            </p>
            <div className='card-display'>
              <img
                src={currentCard.card.front.imgs.normal}
                alt={currentCard.card.front.name}
                className='card-image'
              />
              <p className='card-name'>{currentCard.card.front.name}</p>
            </div>
            {isSubmitted ? (
              <>
                <div className='breakdown'>
                  {scores.length > 0 && (
                    <div className='scores-breakdown-container'>
                      <div className='scores-guess-container'>
                        <div className='scores-guess-text-row'>
                          <p className='score-text-label'>Card Rank:</p>
                          <p className='score-text'>
                            {scores[scores.length - 1].cardRank}
                          </p>
                        </div>
                        <div className='scores-guess-text-row'>
                          <p className='score-text-label'>Your Guess:</p>
                          <p className='score-text'>
                            {scores[scores.length - 1].guess}
                          </p>
                        </div>
                      </div>
                      <div className='scores-score-container'>
                        <p className='score-text-score-label'>Score:</p>
                        <div className='score-text-score-container'>
                          {scores[scores.length - 1].diff === 0 && (
                            <p className='score-text-plus'>+</p>
                          )}
                          <p className='score-text-score'>
                            {scores[scores.length - 1].diff}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={handleNext} className='next-button'>
                  {currentIndex < selectedCards.length - 1
                    ? 'Next Card'
                    : 'View Results'}
                </button>
              </>
            ) : (
              <>
                <form onSubmit={handleSubmit} className='quiz-form'>
                  <div className='user-guess'>{userGuess}</div>
                  <button
                    type='submit'
                    className={
                      userGuess === 0 ? 'inactive-button' : 'guess-button'
                    }
                    disabled={userGuess === 0}
                  >
                    Submit Guess
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Quiz;
