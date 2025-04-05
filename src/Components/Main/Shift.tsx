import React, { useContext, useEffect, useState } from 'react';
import { AppContext, Card } from 'Contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import UserScore from 'Components/Utils/UserScore';
import CardDisplay from 'Components/Utils/CardDisplay';
import 'Styles/Main/Quiz.css';

type ShiftGuess = 'increased' | 'decreased' | 'same' | null;

const Shift: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }

  const {
    players,
    setPlayers,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    numberOfCards,
    shiftData2024,
    shiftData2023,
    started,
    setStarted,
    isSubmitted,
    setIsSubmitted,
    finished,
    setFinished,
  } = context;

  const [selectedCards, setSelectedCards] = useState<
    Array<{
      card: Card;
      rank2023: number;
      rank2024: number;
    }>
  >([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCardGuesses, setCurrentCardGuesses] = useState<
    Record<number, ShiftGuess>
  >({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Find cards that exist in both years with different ranks
  const getCommonCards = () => {
    return shiftData2024.filter((card2024) => {
      const card2023 = shiftData2023.find(
        (c) => c.card.front.name === card2024.card.front.name
      );
      return card2023 && card2023.rank !== card2024.rank;
    });
  };

  // Shuffle function from Quiz component
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
      const commonCards = getCommonCards();
      const shuffledCards = shuffleCards(commonCards).slice(0, numberOfCards);

      const cardsWithRanks = shuffledCards.map((card2024) => {
        const card2023 = shiftData2023.find(
          (c) => c.card.front.name === card2024.card.front.name
        )!;
        return {
          card: card2024,
          rank2023: card2023.rank!,
          rank2024: card2024.rank!,
        };
      });

      setSelectedCards(cardsWithRanks);
      setStarted(true);
      setCurrentIndex(0);
    }
  }, [started, shiftData2023, shiftData2024, numberOfCards]);

  useEffect(() => {
    if (finished) {
      navigate('/shift-results');
    }
  }, [finished]);

  const handleSubmit = (guess: ShiftGuess) => {
    setCurrentCardGuesses((prev) => ({
      ...prev,
      [players[currentPlayerIndex].order]: guess,
    }));

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex((prev) => prev + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handleNext = () => {
    const actualShift = getActualShift();

    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        const guess = currentCardGuesses[player.order];
        return {
          ...player,
          scores: [
            ...player.scores,
            {
              type: 'shift',
              correct: guess === actualShift,
              guess: guess || 'same',
            },
          ],
        };
      })
    );

    setCurrentCardGuesses({});
    setCurrentPlayerIndex(0);
    setIsSubmitted(false);

    if (currentIndex < selectedCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const getActualShift = (): ShiftGuess => {
    const current = selectedCards[currentIndex];
    if (!current) return 'same';
    if (current.rank2024 > current.rank2023) return 'increased';
    if (current.rank2024 < current.rank2023) return 'decreased';
    return 'same';
  };

  const currentCard = selectedCards[currentIndex]?.card;

  if (!selectedCards.length) {
    return (
      <div className='page-container'>
        <div className='not-found shadow-glow'>
          <h1>Loading Shift Quiz...</h1>
        </div>
      </div>
    );
  }

  return (
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
      <div className='quiz-container'>
        <div className='quiz-content'>
          <p className='card-count'>
            Card {currentIndex + 1} of {numberOfCards}
          </p>

          {players.length > 1 && (
            <p className='quiz-current-player-guess'>
              {isSubmitted
                ? 'All players guessed'
                : `${
                    players[currentPlayerIndex].name ||
                    `Player ${currentPlayerIndex + 1}`
                  }'s guess`}
            </p>
          )}

          <CardDisplay />

          {isSubmitted ? (
            <div className='breakdown'>
              <div className='shift-result'>
                <p>2023 Rank: {selectedCards[currentIndex].rank2023}</p>
                <p>2024 Rank: {selectedCards[currentIndex].rank2024}</p>
                <p>Actual Change: {getActualShift().toUpperCase()}</p>
              </div>
              <button onClick={handleNext} className='next-button blue-glow'>
                {currentIndex < numberOfCards - 1
                  ? 'Next Card'
                  : 'View Results'}
              </button>
            </div>
          ) : (
            <div className='shift-buttons'>
              <button
                className='shift-button increased'
                onClick={() => handleSubmit('increased')}
              >
                Increased ↑
              </button>
              <button
                className='shift-button same'
                onClick={() => handleSubmit('same')}
              >
                Same →
              </button>
              <button
                className='shift-button decreased'
                onClick={() => handleSubmit('decreased')}
              >
                Decreased ↓
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shift;
