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
    const guessNumber = parseInt(userGuess, 10);
    if (isNaN(guessNumber) || guessNumber < 1 || guessNumber > 100) {
      alert('Please enter a valid number between 1 and 100.');
      return;
    }

    const currentCard = selectedCards[currentIndex];
    const cardRank = currentCard.rank as number;
    const diff = Math.abs(cardRank - guessNumber);

    setScores([...scores, { cardRank, guess: guessNumber, diff }]);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    setUserGuess('');
    setIsSubmitted(false);
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
            <p>
              Card {currentIndex + 1} of {selectedCards.length}
            </p>
            <div className='card-display'>
              <img
                src={currentCard.card.front.imgs.normal}
                alt={currentCard.card.front.name}
                className='card-image'
              />
              <h3>{currentCard.card.front.name}</h3>
            </div>
            {isSubmitted ? (
              <div className='breakdown'>
                {scores.length > 0 && (
                  <>
                    <p>
                      <strong>Your Guess:</strong>{' '}
                      {scores[scores.length - 1].guess}
                    </p>
                    <p>
                      <strong>Actual Rank:</strong>{' '}
                      {scores[scores.length - 1].cardRank}
                    </p>
                    <p>
                      <strong>Difference:</strong>{' '}
                      {scores[scores.length - 1].diff}
                    </p>
                  </>
                )}
                <button onClick={handleNext} className='submit-button'>
                  {currentIndex < selectedCards.length - 1
                    ? 'Next Card'
                    : 'View Results'}
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className='quiz-form'>
                  <div className='user-guess'>{userGuess}</div>
                  <button type='submit' className='submit-button'>
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
