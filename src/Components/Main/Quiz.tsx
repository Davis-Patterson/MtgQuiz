import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'Contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import UserScore from 'Components/Utils/UserScore';
import CardDisplay from 'Components/Utils/CardDisplay';
import SlideBar from 'Components/Utils/SlideBar';
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
    numberOfCards,
    currentIndex,
    setCurrentIndex,
    userGuess,
    setUserGuess,
    scores,
    setScores,
    setRevealedRanks,
    finished,
    setFinished,
    started,
    setStarted,
    setCanScroll,
    setShouldFlip,
  } = context;

  const [currentBackground, setCurrentBackground] = useState<string | null>(
    null
  );
  const [nextBackground, setNextBackground] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigate = useNavigate();

  const startGame = () => {
    const validCards = cardData.filter(
      (card) => card.rank !== null && card.salt_score !== null
    );
    const topCards = validCards.slice(0, numberOfCards);
    const shuffled = [...topCards].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    setSelectedCards(selected);
    setCurrentIndex(0);
    setUserGuess(0);
    setScores([]);
    setRevealedRanks([]);
    setFinished(false);
    setStarted(true);
  };

  useEffect(() => {
    if (!started) {
      startGame();
    }
  }, [started]);

  useEffect(() => {
    if (finished) {
      navigate('/results');
    }
  }, [finished]);

  useEffect(() => {
    if (selectedCards.length > 0 && currentIndex >= 0) {
      const currentCard = selectedCards[currentIndex];
      const artCropUrl = currentCard.card.front.imgs.art_crop;

      if (!currentBackground) {
        setCurrentBackground(artCropUrl);
      } else {
        setNextBackground(artCropUrl);
        setIsTransitioning(true);
      }
    }
  }, [currentIndex, selectedCards]);

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setCurrentBackground(nextBackground);
        setNextBackground(null);
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, nextBackground]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(userGuess) || userGuess < 1 || userGuess > numberOfCards) {
      alert(`Please enter a valid number between 1 and ${numberOfCards}.`);
      return;
    }

    const currentCard = selectedCards[currentIndex];
    const cardRank = currentCard.rank as number;
    const diff = Math.abs(cardRank - userGuess);

    setScores([...scores, { cardRank, guess: userGuess, diff }]);
    setRevealedRanks((prev) => [
      ...prev,
      {
        rank: cardRank,
        name: currentCard.card.front.name,
        imageUrl: currentCard.card.front.imgs.normal,
      },
    ]);
    setIsSubmitted(true);
    setCanScroll(false);
  };

  const handleNext = () => {
    setUserGuess(0);
    setIsSubmitted(false);
    setCanScroll(true);

    if (currentIndex < selectedCards.length - 1) {
      setShouldFlip(true);
      setTimeout(() => {
        setShouldFlip(false);
        setCurrentIndex(currentIndex + 1);
      }, 300);
    } else {
      setFinished(true);
    }
  };

  if (selectedCards.length === 0) {
    return <div>Loading quiz data...</div>;
  }

  return (
    <>
      <div className='page-container'>
        <div className='background-container'>
          {currentBackground && (
            <div
              className={`transition-background-img ${
                isTransitioning ? 'fade-out' : 'active'
              }`}
              style={{ backgroundImage: `url(${currentBackground})` }}
            />
          )}
          {nextBackground && (
            <div
              className='transition-background-img fade-in'
              style={{ backgroundImage: `url(${nextBackground})` }}
            />
          )}
          <div className='background-overlay' />
        </div>
        <UserScore />
        <div className='quiz-container'>
          <SlideBar />
          <div className='quiz-content'>
            <p className='card-count'>
              Card {currentIndex + 1} of {selectedCards.length}
            </p>
            <CardDisplay />
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
                          <p className='score-text-plus'>+</p>
                          <p className='score-text-score'>
                            {scores[scores.length - 1].diff}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleNext}
                    className='next-button blue-glow'
                  >
                    {currentIndex < selectedCards.length - 1
                      ? 'Next Card'
                      : 'View Results'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleSubmit} className='quiz-form'>
                  <input
                    type='number'
                    className='user-guess'
                    value={userGuess}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const clampedValue = Math.min(100, Math.max(0, value));
                      setUserGuess(clampedValue);
                    }}
                    min='0'
                    max='100'
                    onFocus={(e) => e.target.select()}
                    inputMode='numeric'
                  />
                  <button
                    type='submit'
                    className={
                      userGuess === 0
                        ? 'inactive-button'
                        : 'guess-button orange-glow'
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
