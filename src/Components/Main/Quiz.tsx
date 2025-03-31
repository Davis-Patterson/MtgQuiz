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
    players,
    setPlayers,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    currentCardGuesses,
    setCurrentCardGuesses,
    cardData,
    selectedCards,
    setSelectedCards,
    numberOfCards,
    currentIndex,
    setCurrentIndex,
    setRevealedRanks,
    selectedRanks,
    setPreviousQuizRanks,
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
  const [guessButtonActive, setGuessButtonActive] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const currentCard = selectedCards[currentIndex];
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
      setCurrentCardGuesses({});
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
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedCards]);

  useEffect(() => {
    const currentGuess = currentCardGuesses[currentPlayer.order];
    if (
      typeof currentGuess === 'number' &&
      currentGuess > 0 &&
      currentGuess <= numberOfCards
    ) {
      setGuessButtonActive(true);
    } else {
      setGuessButtonActive(false);
    }
  }, [currentCardGuesses, currentPlayer.order, numberOfCards]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentGuess = currentCardGuesses[currentPlayer.order];
    if (typeof currentGuess !== 'number' || isNaN(currentGuess)) return;

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex((prev) => prev + 1);
    } else {
      const currentCard = selectedCards[currentIndex];
      const cardRank = currentCard.rank as number;

      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => {
          const guess = currentCardGuesses[player.order];
          return {
            ...player,
            scores: [
              ...player.scores,
              {
                cardRank,
                guess,
                diff: Math.abs(cardRank - guess),
              },
            ],
          };
        })
      );

      setIsSubmitted(true);
      setCanScroll(false);
    }
  };

  const handleNext = () => {
    setCurrentCardGuesses({});
    setCurrentPlayerIndex(0);
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
      setPreviousQuizRanks(quizRanks);
      setFinished(true);
    }
  };

  const handleGuessInput = (rawValue: string) => {
    const numericValue = rawValue.replace(/[^0-9]/g, '');
    let sanitizedValue = numericValue;

    if (numericValue.startsWith('0') && numericValue.length > 1) {
      sanitizedValue = numericValue.slice(1);
    }

    const parsedValue = parseInt(sanitizedValue) || 0;
    const clampedValue = Math.min(100, Math.max(0, parsedValue));

    setCurrentCardGuesses((prev) => ({
      ...prev,
      [currentPlayer.order]: clampedValue,
    }));
  };

  const allGuessedForCurrentRound = players.every(
    (player) => player.scores.length > currentIndex
  );

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
        <UserScore allGuessedForCurrentRound={allGuessedForCurrentRound} />
        <div className='quiz-container'>
          <SlideBar />
          <div className='quiz-content'>
            <p className='card-count'>
              Card {currentIndex + 1} of {selectedCards.length}
            </p>
            {players.length > 1 &&
              (allGuessedForCurrentRound ? (
                <p className='quiz-current-player-guess'>All players guessed</p>
              ) : (
                <p className='quiz-current-player-guess'>
                  {currentPlayer.name
                    ? `${currentPlayer.name.trim()}'s guess:`
                    : `Player ${currentPlayer.order}'s guess:`}
                </p>
              ))}
            <CardDisplay />
            {isSubmitted ? (
              <>
                {players.length === 1 && (
                  <div className='breakdown'>
                    {players[0].scores.length > 0 && (
                      <div className='scores-breakdown-container'>
                        <div className='scores-guess-container'>
                          <div className='scores-guess-text-row'>
                            <p className='score-text-label'>Card Rank:</p>
                            <p className='score-text'>
                              {
                                players[0].scores[players[0].scores.length - 1]
                                  .cardRank
                              }
                            </p>
                          </div>
                          <div className='scores-guess-text-row'>
                            <p className='score-text-label'>Your Guess:</p>
                            <p className='score-text'>
                              {
                                players[0].scores[players[0].scores.length - 1]
                                  .guess
                              }
                            </p>
                          </div>
                        </div>
                        <div className='scores-score-container'>
                          <p className='score-text-score-label'>Score:</p>
                          <div className='score-text-score-container'>
                            <p className='score-text-plus'>+</p>
                            <p className='score-text-score'>
                              {
                                players[0].scores[players[0].scores.length - 1]
                                  .diff
                              }
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
                )}
                {players.length > 1 && players[0].scores.length > 0 && (
                  <div className='multi-breakdown'>
                    <div className='multi-breakdown-container'>
                      <div className='card-rank-display'>
                        <p className='multi-score-text-label'>Card Rank:</p>
                        <p className='multi-score-text'>
                          {players[0].scores.slice(-1)[0].cardRank}
                        </p>
                      </div>

                      <div className='stat-cards-container'>
                        {players.map((player) => {
                          const lastScore = player.scores.slice(-1)[0];
                          return (
                            <div key={player.id} className='stat-card'>
                              <p className='stat-player-name'>
                                {player.name || `Player ${player.order}`}
                              </p>
                              <p className='stat-player-guess'>
                                Guess: {lastScore.guess}
                              </p>
                              <p className='stat-player-diff'>
                                Score: +{lastScore.diff}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={handleNext}
                      className='next-button blue-glow'
                    >
                      {currentIndex < selectedCards.length - 1
                        ? 'Next Card'
                        : 'View Results'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <form onSubmit={handleSubmit} className='quiz-form'>
                  <input
                    type='text'
                    className='user-guess'
                    value={
                      currentCardGuesses[currentPlayer.order] === 0
                        ? 'Ø'
                        : currentCardGuesses[currentPlayer.order]?.toString() ||
                          'Ø'
                    }
                    onChange={(e) => handleGuessInput(e.target.value)}
                    onFocus={(e) => {
                      if (currentCardGuesses[currentPlayer.order] === 0) {
                        e.target.value = '';
                      }
                      e.target.select();
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        setCurrentCardGuesses((prev) => ({
                          ...prev,
                          [currentPlayer.order]: 0,
                        }));
                      }
                    }}
                    inputMode='numeric'
                    style={{
                      color: !guessButtonActive
                        ? 'var(--clr-divider)'
                        : 'inherit',
                    }}
                  />
                  <button
                    type='submit'
                    className={
                      guessButtonActive
                        ? 'guess-button orange-glow'
                        : 'inactive-button'
                    }
                    disabled={!guessButtonActive}
                  >
                    <p className='quiz-button-text'>
                      {currentPlayer.name
                        ? `Submit ${currentPlayer.name}`
                        : `Submit Player ${currentPlayer.order}`}
                    </p>
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
