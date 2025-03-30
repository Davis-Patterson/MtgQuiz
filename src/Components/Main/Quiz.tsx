import React, { useContext, useEffect, useState } from 'react';
import { AppContext, RevealedCard } from 'Contexts/AppContext';
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
    selectedRanks,
    setSelectedRanks,
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
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigate = useNavigate();

  const shuffleCards = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (!started) {
      const validCards = cardData.filter(
        (card) =>
          card.rank !== null &&
          card.salt_score !== null &&
          !selectedRanks.has(card.rank) &&
          card.rank <= numberOfCards
      );

      const initialRevealed = Array.from(selectedRanks)
        .map((rank) => {
          const card = cardData.find((c) => c.rank === rank);
          return card
            ? {
                rank: card.rank,
                name: card.card.front.name,
                imageUrl: card.card.front.imgs.normal,
              }
            : null;
        })
        .filter(Boolean) as RevealedCard[];

      const shuffled = shuffleCards(validCards);
      const selected = shuffled.slice(0, 10);

      setSelectedCards(selected);
      setRevealedRanks(initialRevealed);
      setCurrentIndex(0);
      setUserGuess(0);
      setScores([]);
      setFinished(false);
      setStarted(true);
    }
  }, [
    started,
    cardData,
    numberOfCards,
    selectedRanks,
    setRevealedRanks,
    setSelectedCards,
    setStarted,
  ]);

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

  useEffect(() => {
    if (cardData && cardData.length > 0) {
      const randomIndex = Math.floor(Math.random() * cardData.length);
      const artCropUrl = cardData[randomIndex].card.front.imgs.art_crop;
      setBackgroundImage(artCropUrl);
    }
  }, [cardData]);

  useEffect(() => {
    if (selectedCards.length === 0) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedCards]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      const quizRanks = new Set(selectedRanks);
      selectedCards.forEach((card) => {
        if (card.rank !== null) {
          quizRanks.add(card.rank);
        }
      });
      setSelectedRanks(quizRanks);

      setFinished(true);
    }
  };

  const handleGuessInput = (rawValue: string) => {
    if (rawValue === 'Ø' || rawValue === '') {
      setUserGuess(0);
      return;
    }

    const numericValue = rawValue.replace(/[^0-9]/g, '');

    let sanitizedValue = numericValue;
    if (numericValue.startsWith('0') && numericValue.length > 1) {
      sanitizedValue = numericValue.slice(1);
    }

    const parsedValue = parseInt(sanitizedValue) || 0;

    if (parsedValue === 0) {
      setUserGuess(0);
    } else {
      const clampedValue = Math.min(100, Math.max(1, parsedValue));
      setUserGuess(clampedValue);
    }
  };

  if (selectedCards.length === 0) {
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
          <div className='not-found shadow-glow'>
            <div className='quiz-not-found-header'>
              <div className='quiz-not-found-header-text-container'>
                <h1 className='quiz-not-found-header-text'>404: No Data</h1>
              </div>
              <div className='quiz-not-found-header-subtext-container'>
                <p className='quiz-not-found-header-subtext'>
                  We could not start the quiz, please try again.
                </p>
                <p className='quiz-not-found-header-subtext'>
                  Redirecting to homepage...
                </p>
              </div>
            </div>
            <div className='quiz-not-found-content-container'></div>
          </div>
        </div>
      </>
    );
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
                    type='text'
                    className='user-guess'
                    value={userGuess === 0 ? 'Ø' : userGuess.toString()}
                    onChange={(e) => handleGuessInput(e.target.value)}
                    onFocus={(e) => {
                      if (userGuess === 0) {
                        e.target.value = '';
                      }
                      e.target.select();
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        setUserGuess(0);
                      }
                    }}
                    inputMode='numeric'
                    style={{
                      color: userGuess === 0 ? 'var(--clr-divider)' : 'inherit',
                    }}
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
