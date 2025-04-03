import React, { useContext, useEffect, useState } from 'react';
import { AppContext, Card, RevealedCard } from 'Contexts/AppContext';
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
    currentCardStats,
    setCurrentCardStats,
    cardData,
    setCardStats,
    selectedCards,
    setSelectedCards,
    numberOfCards,
    setNumberOfCards,
    rangeOfQuiz,
    currentIndex,
    setCurrentIndex,
    setRevealedRanks,
    excludedRanks,
    includedRanks,
    creatorRanks,
    setPreviousQuizRanks,
    started,
    setStarted,
    isSubmitted,
    setIsSubmitted,
    finished,
    setFinished,
    setCanScroll,
    setShouldFlip,
  } = context;

  const [currentBackground, setCurrentBackground] = useState<string | null>(
    null
  );
  const [nextBackground, setNextBackground] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

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
      let selected: Card[] = [];
      let finalNumberOfCards = numberOfCards;

      if (creatorRanks.size > 0) {
        const creatorCards = Array.from(creatorRanks)
          .map((rank) => cardData.find((c) => c.rank === rank))
          .filter((card): card is Card => !!card);

        selected = creatorCards;
        finalNumberOfCards = creatorCards.length;
        setNumberOfCards(creatorCards.length);
      } else if (includedRanks.size > 0) {
        const validIncludedCards = Array.from(includedRanks)
          .map((rank) =>
            cardData.find(
              (c) =>
                c.rank === rank &&
                !excludedRanks.has(rank) &&
                c.rank <= rangeOfQuiz
            )
          )
          .filter((card): card is Card => !!card);

        const shuffledIncluded = shuffleCards(validIncludedCards);
        const neededCards = finalNumberOfCards - shuffledIncluded.length;

        if (neededCards > 0) {
          const remainingValidCards = cardData.filter(
            (card) =>
              card.rank !== null &&
              card.salt_score !== null &&
              !excludedRanks.has(card.rank) &&
              !includedRanks.has(card.rank) &&
              card.rank <= rangeOfQuiz
          );

          const additionalCards = shuffleCards(remainingValidCards).slice(
            0,
            neededCards
          );
          selected = shuffleCards([...shuffledIncluded, ...additionalCards]);
        } else {
          selected = shuffledIncluded.slice(0, finalNumberOfCards);
        }
      } else {
        const validCards = cardData.filter(
          (card) =>
            card.rank !== null &&
            card.salt_score !== null &&
            !excludedRanks.has(card.rank) &&
            card.rank <= rangeOfQuiz
        );
        selected = shuffleCards(validCards).slice(0, finalNumberOfCards);
      }

      const initialRevealed = Array.from(excludedRanks)
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

      setRevealedRanks(initialRevealed);
      setSelectedCards(selected);
      setCurrentIndex(0);
      setCurrentCardGuesses({});
      setFinished(false);
      setStarted(true);
    }
  }, [
    started,
    cardData,
    rangeOfQuiz,
    excludedRanks,
    includedRanks,
    creatorRanks,
    setRevealedRanks,
    setSelectedCards,
    setStarted,
    numberOfCards,
    setNumberOfCards,
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
      currentGuess <= rangeOfQuiz
    ) {
      setGuessButtonActive(true);
    } else {
      setGuessButtonActive(false);
    }
  }, [currentCardGuesses, currentPlayer.order, rangeOfQuiz]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentGuess = currentCardGuesses[currentPlayer.order];
    if (typeof currentGuess !== 'number' || isNaN(currentGuess)) return;

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex((prev) => prev + 1);
    } else {
      processCardResults();
      setIsSubmitted(true);
      setCanScroll(false);
    }
  };

  const processCardResults = () => {
    const currentCard = selectedCards[currentIndex];
    if (!currentCard?.rank) return;

    const cardRank = currentCard.rank;
    const guesses = Object.values(currentCardGuesses);

    if (guesses.length !== players.length) {
      console.error('Missing guesses for some players');
      return;
    }

    const avgGuess = guesses.reduce((a, b) => a + b, 0) / guesses.length;

    setCurrentCardStats({
      cardRank,
      averageGuess: avgGuess,
    });

    if (currentCard.card?.front?.imgs?.normal) {
      const revealedCard = {
        rank: cardRank,
        name: currentCard.card.front.name,
        imageUrl: currentCard.card.front.imgs.normal,
      };
      setRevealedRanks((prev) => [...prev, revealedCard]);
    }
  };

  const handleNext = () => {
    if (!currentCardStats) return;

    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        scores: [
          ...player.scores,
          {
            cardRank: currentCardStats.cardRank,
            guess: currentCardGuesses[player.order],
            diff: Math.abs(
              currentCardStats.cardRank - currentCardGuesses[player.order]
            ),
          },
        ],
      }))
    );

    setCardStats((prev) => [...prev, currentCardStats]);
    setCurrentCardGuesses({});
    setCurrentCardStats(null);
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
      const quizRanks = new Set([
        ...excludedRanks,
        ...(selectedCards.map((card) => card.rank).filter(Boolean) as number[]),
      ]);
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

  const calculateTotalScore = (player: (typeof players)[0]) => {
    const historicalTotal = player.scores.reduce(
      (sum, score) => sum + score.diff,
      0
    );
    const currentGuess = currentCardGuesses[player.order] || 0;
    const currentDiff = currentCardStats
      ? Math.abs(currentCardStats.cardRank - currentGuess)
      : 0;

    return historicalTotal + (isSubmitted ? currentDiff : 0);
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
              Card {currentIndex + 1} of {numberOfCards}
            </p>
            {players.length > 1 &&
              (isSubmitted ? (
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
                {players.length === 1
                  ? currentCardStats && (
                      <div className='breakdown'>
                        <div className='scores-breakdown-container'>
                          <div className='scores-guess-container'>
                            <div className='scores-guess-text-row'>
                              <p className='score-text-label'>Card Rank:</p>
                              <p className='score-text'>
                                {currentCardStats.cardRank}
                              </p>
                            </div>
                            <div className='scores-guess-text-row'>
                              <p className='score-text-label'>Your Guess:</p>
                              <p className='score-text'>
                                {currentCardGuesses[currentPlayer.order]}
                              </p>
                            </div>
                          </div>
                          <div className='scores-score-container'>
                            <p className='score-text-score-label'>Score:</p>
                            <div className='score-text-score-container'>
                              <p className='score-text-plus'>+</p>
                              <p className='score-text-score'>
                                {Math.abs(
                                  currentCardStats.cardRank -
                                    currentCardGuesses[currentPlayer.order]
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleNext}
                          className='next-button blue-glow'
                        >
                          {currentIndex < numberOfCards - 1
                            ? 'Next Card'
                            : 'View Results'}
                        </button>
                      </div>
                    )
                  : currentCardStats && (
                      <div className='multi-breakdown'>
                        <div className='multi-breakdown-container'>
                          <div className='card-rank-display'>
                            <div className='multi-score-text-container'>
                              <p className='multi-score-text-label'>
                                Card Rank:
                              </p>
                              {currentCardStats && (
                                <>
                                  <p className='multi-score-text'>
                                    {currentCardStats.cardRank}
                                  </p>
                                </>
                              )}
                            </div>
                            <div className='multi-score-text-container'>
                              {currentCardStats && (
                                <>
                                  <p className='multi-score-average-label'>
                                    Avg Guess:
                                  </p>
                                  <p className='multi-score-average-text'>
                                    {currentCardStats.averageGuess.toFixed(1)}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          <div className='stat-cards-container'>
                            {players.map((player) => {
                              const currentGuess =
                                currentCardGuesses[player.order];
                              return (
                                <>
                                  {players.length === 2 ? (
                                    <div
                                      key={player.id}
                                      className='duo-stat-card'
                                    >
                                      <p className='stat-player-name'>
                                        {player.name ||
                                          `Player ${player.order}`}
                                      </p>
                                      <div className='duo-stat-container'>
                                        <div className='duo-guess-container'>
                                          <p className='stat-player-guess'>
                                            Guess: {currentGuess}
                                          </p>
                                          <p className='stat-player-diff'>
                                            Score: +
                                            {Math.abs(
                                              currentCardStats.cardRank -
                                                currentGuess
                                            )}
                                          </p>
                                        </div>
                                        {currentCardStats && (
                                          <div className='duo-total-container'>
                                            {currentCardStats && (
                                              <>
                                                <p className='stat-player-total-label'>
                                                  Total
                                                </p>
                                                <p className='stat-player-total'>
                                                  {calculateTotalScore(player)}
                                                </p>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div key={player.id} className='stat-card'>
                                      <p className='stat-player-name'>
                                        {player.name ||
                                          `Player ${player.order}`}
                                      </p>
                                      <p className='stat-player-guess'>
                                        Guess: {currentGuess}
                                      </p>
                                      {currentCardStats && (
                                        <p className='stat-player-diff'>
                                          Score: +
                                          {Math.abs(
                                            currentCardStats.cardRank -
                                              currentGuess
                                          )}
                                        </p>
                                      )}
                                      {currentCardStats && (
                                        <p className='stat-player-diff'>
                                          Total: {calculateTotalScore(player)}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </>
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
