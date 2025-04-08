import React, { useContext, useEffect, useState } from 'react';
import { AppContext, Card } from 'Contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import UserScore from 'Components/Utils/UserScore';
import CardDisplay from 'Components/Utils/CardDisplay';
import ChevronIcon from 'Svgs/ChevronIcon';
import StripedArrow from 'Svgs/StripedArrow';
import DoubleIcon from 'Svgs/DoubleIcon';
import Tooltip from '@mui/material/Tooltip';
import 'Styles/Main/Shift.css';

const Shift: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {
    gameMode,
    players,
    setPlayers,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    cardData,
    selectedCards,
    setSelectedCards,
    numberOfCards,
    rangeOfQuiz,
    currentIndex,
    setCurrentIndex,
    started,
    setStarted,
    isSubmitted,
    setIsSubmitted,
    finished,
    setFinished,
    setShouldFlip,
    shiftData2023,
    shiftData2024,
    currentShiftGuesses,
    setCurrentShiftGuesses,
  } = context;

  const [currentBackground, setCurrentBackground] = useState<string | null>(
    null
  );
  const [nextBackground, setNextBackground] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [guessButtonActive, setGuessButtonActive] = useState(false);

  const [actualDirection, setActualDirection] = useState<number>(0);

  const showStats = false;

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
    if (!started && gameMode === 'shift') {
      const years: number[] = [];
      if (shiftData2023?.length) years.push(2023);
      if (shiftData2024?.length) years.push(2024);

      if (years.length < 2) {
        console.error('Not enough years with data');
        setSelectedCards([]);
        return;
      }

      const allCards = [
        ...shiftData2023.map((c) => ({ ...c, year: 2023 })),
        ...shiftData2024.map((c) => ({ ...c, year: 2024 })),
      ];

      const cardsByName = allCards.reduce((acc, card) => {
        const key = card.card.front.name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(card);
        return acc;
      }, {} as Record<string, typeof allCards>);

      const commonCards: Card[] = [];

      Object.values(cardsByName).forEach((group) => {
        const sorted = group.sort((a, b) => a.year - b.year);
        for (let i = 1; i < sorted.length; i++) {
          const current = sorted[i];
          const previous = sorted[i - 1];
          if (current.rank !== null && previous.rank !== null) {
            if (current.rank !== previous.rank) {
              commonCards.push({
                ...current,
                previousRank: previous.rank,
                previousYear: previous.year,
                currentYear: current.year,
              });
            }
          }
        }
      });

      const increased = commonCards.filter(
        (card) => card.rank! < card.previousRank!
      );
      const decreased = commonCards.filter(
        (card) => card.rank! > card.previousRank!
      );

      const shuffledIncreased = shuffleCards([...increased]);
      const shuffledDecreased = shuffleCards([...decreased]);

      const maxBalanced = Math.min(
        shuffledIncreased.length,
        shuffledDecreased.length,
        Math.floor(numberOfCards / 2)
      );

      const selectedIncreased = shuffledIncreased.slice(0, maxBalanced);
      const selectedDecreased = shuffledDecreased.slice(0, maxBalanced);

      let selected = [...selectedIncreased, ...selectedDecreased];
      let remaining = numberOfCards - selected.length;

      if (remaining > 0) {
        const remainingIncreased = shuffledIncreased.slice(maxBalanced);
        const remainingDecreased = shuffledDecreased.slice(maxBalanced);

        let remainingPool;
        if (remainingIncreased.length >= remainingDecreased.length) {
          remainingPool = [...remainingIncreased, ...remainingDecreased];
        } else {
          remainingPool = [...remainingDecreased, ...remainingIncreased];
        }

        selected.push(...remainingPool.slice(0, remaining));
      }

      const shuffledSelected = shuffleCards(selected);

      if (shuffledSelected.length >= numberOfCards) {
        const finalSelected = shuffledSelected.slice(0, numberOfCards);

        let selectedIncreasedCount = 0,
          selectedDecreasedCount = 0;
        finalSelected.forEach((card) => {
          if (card.rank! < card.previousRank!) selectedIncreasedCount++;
          else selectedDecreasedCount++;
        });

        const totalCards2023 = shiftData2023.length;
        const totalCards2024 = shiftData2024.length;
        const totalCommon = commonCards.length;
        const newAdditions = totalCards2023 + totalCards2024 - totalCommon * 2;

        let increased = 0,
          decreased = 0,
          same = 0;
        commonCards.forEach((card) => {
          if (card.previousRank && card.rank) {
            const diff = card.previousRank - card.rank;
            if (diff > 0) increased++;
            else if (diff < 0) decreased++;
            else same++;
          }
        });

        let selectedIncreased = 0,
          selectedDecreased = 0,
          selectedSame = 0;
        selected.forEach((card) => {
          if (card.previousRank && card.rank) {
            const diff = card.previousRank - card.rank;
            if (diff > 0) selectedIncreased++;
            else if (diff < 0) selectedDecreased++;
            else selectedSame++;
          }
        });

        if (showStats) {
          console.log('=== Card Statistics ===');
          console.log(`Total common cards: ${totalCommon}`);
          console.log(`Total new additions: ${newAdditions}`);
          console.log(`Common card changes:`);
          console.log(
            `Increased: ${increased} (${(
              (increased / totalCommon) *
              100
            ).toFixed(1)}%)`
          );
          console.log(
            `Decreased: ${decreased} (${(
              (decreased / totalCommon) *
              100
            ).toFixed(1)}%)`
          );
          console.log(
            `Same rank: ${same} (${((same / totalCommon) * 100).toFixed(1)}%)`
          );
          console.log(`\nQuiz Card Selection (${selected.length} cards):`);
          console.log(`Increased: ${selectedIncreased}`);
          console.log(`Decreased: ${selectedDecreased}`);
          console.log(`Same rank: ${selectedSame}`);
          console.log(
            `Ratio: ${(
              (selectedIncreasedCount / finalSelected.length) *
              100
            ).toFixed(1)}%`
          );
        }

        setSelectedCards(finalSelected);
        setStarted(true);
        setFinished(false);
        setCurrentIndex(0);
        setCurrentShiftGuesses({});
      } else {
        console.error('Not enough common cards between years');
        setSelectedCards([]);
      }
    }
  }, [
    started,
    gameMode,
    shiftData2023,
    shiftData2024,
    numberOfCards,
    setSelectedCards,
    setStarted,
    setFinished,
    setCurrentIndex,
    setCurrentShiftGuesses,
  ]);

  const handleGuess = (direction: 'increase' | 'decrease' | 'same') => {
    const currentGuess = currentShiftGuesses[players[currentPlayerIndex].id];
    const value =
      direction === 'increase' ? 1 : direction === 'decrease' ? -1 : 0;

    const newValue = currentGuess === value ? undefined : value;

    setCurrentShiftGuesses((prev) => ({
      ...prev,
      [players[currentPlayerIndex].id]: newValue,
    }));
  };

  const handleSubmit = () => {
    if (!currentCard || currentCard.rank === null || !currentCard.previousRank)
      return;

    if (currentPlayerIndex === players.length - 1) {
      const calculatedDirection =
        currentCard.rank < currentCard.previousRank
          ? 1
          : currentCard.rank > currentCard.previousRank
          ? -1
          : 0;

      setActualDirection(calculatedDirection);

      const updatedPlayers = players.map((player) => {
        const playerGuess = currentShiftGuesses[player.id];
        const isCorrect = playerGuess === calculatedDirection;

        return {
          ...player,
          scores: [
            ...player.scores,
            {
              cardRank: currentCard.rank!,
              guess: playerGuess ?? 0,
              diff: isCorrect ? 0 : 1,
              correct: isCorrect,
            },
          ],
        };
      });

      setPlayers(updatedPlayers);
      setIsSubmitted(true);
    } else {
      setCurrentPlayerIndex((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setCurrentShiftGuesses({});
    setIsSubmitted(false);

    if (currentIndex < selectedCards.length - 1) {
      setShouldFlip(true);
      setTimeout(() => {
        setShouldFlip(false);
        setCurrentIndex((prev) => prev + 1);
        setCurrentPlayerIndex(0);
      }, 300);
    } else {
      setFinished(true);
    }
  };

  useEffect(() => {
    if (finished) {
      navigate('/shift/results');
    }
  }, [finished]);

  useEffect(() => {
    if (selectedCards.length > 0 && currentIndex >= 0) {
      const artCropUrl = selectedCards[currentIndex]?.card.front.imgs.art_crop;
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
    if (cardData && cardData.length > 0 && selectedCards.length === 0) {
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
    const currentGuess = currentShiftGuesses[currentPlayer.order];
    if (
      typeof currentGuess === 'number' &&
      currentGuess > 0 &&
      currentGuess <= rangeOfQuiz
    ) {
      setGuessButtonActive(true);
    } else {
      setGuessButtonActive(false);
    }
  }, [currentShiftGuesses, currentPlayer.order, rangeOfQuiz]);

  useEffect(() => {
    const currentGuess = currentShiftGuesses[currentPlayer.id];
    setGuessButtonActive(currentGuess !== undefined);
  }, [currentShiftGuesses, currentPlayer.id]);

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
            <div className='shift-not-found-header'>
              <div className='shift-not-found-header-text-container'>
                <h1 className='shift-not-found-header-text'>404: No Data</h1>
              </div>
              <div className='shift-not-found-header-subtext-container'>
                <p className='shift-not-found-header-subtext'>
                  We could not start the quiz, please try again.
                </p>
                <p className='shift-not-found-header-subtext'>
                  Redirecting to homepage...
                </p>
              </div>
            </div>
            <div className='shift-not-found-content-container'></div>
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
        <div className='shift-container'>
          <div className='shift-content'>
            <p className='card-count'>
              Card {currentIndex + 1} of {numberOfCards}
            </p>

            {players.length > 1 &&
              (isSubmitted ? (
                <p className='shift-current-player-guess'>
                  All players guessed
                </p>
              ) : (
                <p className='shift-current-player-guess'>
                  {currentPlayer.name
                    ? `${currentPlayer.name.trim()}'s guess:`
                    : `Player ${currentPlayer.order}'s guess:`}
                </p>
              ))}

            <CardDisplay />

            {isSubmitted ? (
              <div className='shift-breakdown'>
                <div className='shift-breakdown-container'>
                  <h3
                    className={`shift-revealed-direction ${
                      actualDirection === 1 ? 'increased' : 'decreased'
                    }`}
                  >
                    {currentCard?.previousRank !== undefined &&
                    currentCard?.previousRank !== null &&
                    currentCard?.rank !== undefined &&
                    currentCard?.rank !== null
                      ? (() => {
                          const prevRank = currentCard.previousRank;
                          const currRank = currentCard.rank;
                          const difference = prevRank - currRank;

                          return (
                            <div className='shift-direction-container'>
                              <p>
                                {difference > 0 ? 'Increased' : 'Decreased'}
                              </p>
                              <ChevronIcon
                                className={`chevron-icon ${
                                  difference > 0 ? 'increase' : 'decrease'
                                }`}
                              />
                              <p>
                                {Math.abs(difference)} rank
                                {Math.abs(difference) !== 1 ? 's' : ''}
                              </p>
                            </div>
                          );
                        })()
                      : 'Rank change'}
                  </h3>
                  <div className='shift-year-labels'>
                    <Tooltip
                      title={
                        <>
                          <p className='tooltip-text'>
                            {currentCard?.previousYear}
                          </p>
                          <p className='tooltip-text'>Card Rank</p>
                        </>
                      }
                      enterDelay={400}
                      placement='top'
                    >
                      <div className='shift-year-label-value-container'>
                        <p
                          className={`shift-year-label-value ${
                            currentCard?.previousRank === 100 ? 'max' : ''
                          }`}
                        >
                          {currentCard?.previousRank}
                        </p>
                      </div>
                    </Tooltip>
                    <div className='shift-year-label-years-container'>
                      <span className='shift-year-label-text'>
                        {currentCard?.previousYear}
                      </span>
                      <StripedArrow className='striped-arrow' />
                      <span className='shift-year-label-text'>
                        {currentCard?.currentYear}
                      </span>
                    </div>
                    <Tooltip
                      title={
                        <>
                          <p className='tooltip-text'>
                            {currentCard?.currentYear}
                          </p>
                          <p className='tooltip-text'>Card Rank</p>
                        </>
                      }
                      enterDelay={400}
                      placement='top'
                    >
                      <div className='shift-year-label-value-container'>
                        <p
                          className={`shift-year-label-value ${
                            currentCard?.rank === 100 ? 'max' : ''
                          }`}
                        >
                          {currentCard?.rank}
                        </p>
                      </div>
                    </Tooltip>
                  </div>

                  {players.length === 1 ? (
                    <div className='shift-player-results'>
                      {players.map((player) => (
                        <div key={player.id} className='shift-player-result'>
                          <p className='shift-player-name'>
                            {player.name || `Player ${player.order}`}:
                          </p>
                          <p
                            className={`shift-player-outcome ${
                              currentShiftGuesses[player.id] === actualDirection
                                ? 'correct'
                                : 'incorrect'
                            }`}
                          >
                            {currentShiftGuesses[player.id] === actualDirection
                              ? 'Correct'
                              : 'Incorrect'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : players.length === 2 ? (
                    <div className='shift-multi-results'>
                      {players.map((player) => (
                        <div key={player.id} className='shift-duo-result'>
                          <p className='shift-multi-player-name'>
                            {player.name || `Player ${player.order}`}:
                          </p>
                          <p
                            className={`shift-multi-outcome ${
                              currentShiftGuesses[player.id] === actualDirection
                                ? 'correct'
                                : 'incorrect'
                            }`}
                          >
                            {currentShiftGuesses[player.id] === actualDirection
                              ? 'Correct'
                              : 'Incorrect'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : players.length === 3 ? (
                    <div className='shift-multi-results'>
                      {players.map((player) => (
                        <div key={player.id} className='shift-trio-result'>
                          <p className='shift-multi-player-name'>
                            {player.name || `Player ${player.order}`}:
                          </p>
                          <p
                            className={`shift-multi-outcome ${
                              currentShiftGuesses[player.id] === actualDirection
                                ? 'correct'
                                : 'incorrect'
                            }`}
                          >
                            {currentShiftGuesses[player.id] === actualDirection
                              ? 'Correct'
                              : 'Incorrect'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='shift-multi-results'>
                      {players.map((player) => (
                        <div key={player.id} className='shift-multi-result'>
                          <p className='shift-multi-player-name'>
                            {player.name || `Player ${player.order}`}:
                          </p>
                          <p
                            className={`shift-multi-outcome ${
                              currentShiftGuesses[player.id] === actualDirection
                                ? 'correct'
                                : 'incorrect'
                            }`}
                          >
                            {currentShiftGuesses[player.id] === actualDirection
                              ? 'Correct'
                              : 'Incorrect'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className='shift-submit-container'>
                  <button
                    onClick={handleNext}
                    className='next-button blue-glow'
                  >
                    <p className='quiz-button-text'>
                      {currentIndex < numberOfCards - 1
                        ? 'Next Card'
                        : 'View Results'}
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className='shift-year-labels'>
                  <Tooltip
                    title={
                      <>
                        <p className='tooltip-text'>
                          {currentCard?.previousYear}
                        </p>
                        <p className='tooltip-text'>Card Rank</p>
                      </>
                    }
                    enterDelay={400}
                    placement='top'
                  >
                    <div className='shift-year-label-value-container'>
                      <p
                        className={`shift-year-label-value ${
                          currentCard?.previousRank === 100 ? 'max' : ''
                        }`}
                      >
                        {currentCard?.previousRank}
                      </p>
                    </div>
                  </Tooltip>
                  <div className='shift-year-label-years-container'>
                    <span className='shift-year-label-text'>
                      {currentCard?.previousYear}
                    </span>
                    <StripedArrow className='striped-arrow' />
                    <span className='shift-year-label-text'>
                      {currentCard?.currentYear}
                    </span>
                  </div>
                  <Tooltip
                    title={
                      <>
                        <p className='tooltip-text'>
                          Was this rank increased, decreased,
                        </p>
                        <p className='tooltip-text'>{`or stayed the same since ${currentCard?.previousYear}?`}</p>
                      </>
                    }
                    enterDelay={400}
                    placement='top'
                  >
                    <div className='shift-year-label-value-container'>
                      <p className='shift-year-label-value'>??</p>
                    </div>
                  </Tooltip>
                </div>
                <div
                  className={`guess-buttons ${
                    currentShiftGuesses[currentPlayer.id] === undefined
                      ? ''
                      : 'selected'
                  }`}
                >
                  <Tooltip
                    title={
                      <>
                        <p className='tooltip-text'>
                          {`Card ranking was decreased since ${currentCard?.previousYear}`}
                        </p>
                        <p className='tooltip-text'>
                          (Larger number represents lower ranking)
                        </p>
                      </>
                    }
                    enterDelay={800}
                    placement='top'
                  >
                    <button
                      onClick={() => handleGuess('decrease')}
                      className={`decrease-button ${
                        currentShiftGuesses[currentPlayer.id] === undefined
                          ? ''
                          : currentShiftGuesses[currentPlayer.id] === -1
                          ? 'selected red-glow'
                          : 'unselected'
                      }`}
                    >
                      <DoubleIcon
                        className={`decrease-icon ${
                          currentShiftGuesses[currentPlayer.id] === undefined
                            ? ''
                            : currentShiftGuesses[currentPlayer.id] === -1
                            ? 'selected'
                            : 'unselected'
                        }`}
                      />
                      <p className='option-button-text'>Decreased</p>
                    </button>
                  </Tooltip>
                  <div
                    className={`option-indicator-container ${
                      currentShiftGuesses[currentPlayer.id] === undefined
                        ? ''
                        : currentShiftGuesses[currentPlayer.id] === -1
                        ? 'decrease'
                        : 'increase'
                    }`}
                  >
                    <p className='option-indicator-text'>
                      {currentShiftGuesses[currentPlayer.id] === undefined ? (
                        'Ø'
                      ) : currentShiftGuesses[currentPlayer.id] === -1 ? (
                        <ChevronIcon className='option-indicator-decrease' />
                      ) : (
                        <ChevronIcon className='option-indicator-increase' />
                      )}
                    </p>
                  </div>
                  <Tooltip
                    title={
                      <>
                        <p className='tooltip-text'>
                          {`Card ranking was increased since ${currentCard?.previousYear}`}
                        </p>
                        <p className='tooltip-text'>
                          (Smaller number represents higher ranking)
                        </p>
                      </>
                    }
                    enterDelay={800}
                    placement='top'
                  >
                    <button
                      onClick={() => handleGuess('increase')}
                      className={`increase-button ${
                        currentShiftGuesses[currentPlayer.id] === undefined
                          ? ''
                          : currentShiftGuesses[currentPlayer.id] === 1
                          ? 'selected green-glow'
                          : 'unselected'
                      }`}
                    >
                      <p className='option-button-text'>Increased</p>
                      <DoubleIcon
                        className={`increase-icon ${
                          currentShiftGuesses[currentPlayer.id] === undefined
                            ? ''
                            : currentShiftGuesses[currentPlayer.id] === 1
                            ? 'selected'
                            : 'unselected'
                        }`}
                      />
                    </button>
                  </Tooltip>
                </div>
                <div className='shift-submit-container'>
                  <button
                    onClick={handleSubmit}
                    className={
                      guessButtonActive
                        ? 'guess-button orange-glow'
                        : 'inactive-button'
                    }
                    disabled={!guessButtonActive}
                  >
                    <p className='quiz-button-text'>
                      {players.length > 1
                        ? `Submit ${
                            players[currentPlayerIndex].name ||
                            `Player ${currentPlayerIndex + 1}`
                          }`
                        : 'Submit'}
                    </p>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Shift;
