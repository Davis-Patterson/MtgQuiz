import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from 'Contexts/AppContext';
import XIcon from 'Svgs/XIcon';
import EraserIcon from 'Svgs/EraserIcon';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import 'Styles/Utils/KnownCards.css';

const KnownCards: React.FC = () => {
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('No Context');
  }
  const {
    cardData,
    numberOfCards,
    setNumberOfCards,
    showKnownCards,
    setShowKnownCards,
    selectedRanks,
    setSelectedRanks,
  } = appContext;

  const [renderContainer, setRenderContainer] = useState(false);

  const [knownCardsButtonActive, setKnownCardsButtonActive] = useState(false);
  const [knownCardsEraserActive, setKnownCardsEraserActive] = useState(false);
  const [alreadySelectedRanks, setAlreadySelectedRanks] = useState<Set<number>>(
    new Set(selectedRanks)
  );
  const [toBeSelectedRanks, setToBeSelectedRanks] = useState<Set<number>>(
    new Set(selectedRanks)
  );

  const [isLoading, setIsLoading] = useState(false);

  const knownCardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSet = new Set(selectedRanks);
    setAlreadySelectedRanks(newSet);
    setToBeSelectedRanks(newSet);
  }, [selectedRanks]);

  const hasChanges = () => {
    if (alreadySelectedRanks.size !== toBeSelectedRanks.size) return true;
    for (const rank of alreadySelectedRanks) {
      if (!toBeSelectedRanks.has(rank)) return true;
    }
    return false;
  };

  useEffect(() => {
    if (showKnownCards) {
      setRenderContainer(true);
    } else {
      const timer = setTimeout(() => {
        setRenderContainer(false);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [showKnownCards]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        knownCardsContainerRef.current &&
        !knownCardsContainerRef.current.contains(event.target as Node)
      ) {
        setShowKnownCards(false);
      }
    };

    if (showKnownCards) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showKnownCards, setShowKnownCards]);

  useEffect(() => {
    const validSelected = Array.from(toBeSelectedRanks).filter(
      (rank) => rank <= numberOfCards
    ).length;
    const availableCards = numberOfCards - validSelected;
    const hasEnoughCards = availableCards >= 10;

    setKnownCardsButtonActive(hasChanges() && hasEnoughCards);
  }, [toBeSelectedRanks, alreadySelectedRanks, numberOfCards]);

  useEffect(() => {
    const hasSelectedCards = toBeSelectedRanks.size > 0;

    setKnownCardsEraserActive(hasSelectedCards);
  }, [toBeSelectedRanks]);

  const handleRankSelection = (rank: number) => {
    if (rank > numberOfCards) return;

    setToBeSelectedRanks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rank)) {
        newSet.delete(rank);
      } else {
        newSet.add(rank);
      }
      return newSet;
    });
  };

  const handleCardNumber = (value: number) => {
    if (numberOfCards === value) {
      setNumberOfCards(0);
    } else {
      setNumberOfCards(value);
    }
  };

  const getRankClass = (rank: number) => {
    const classes = ['known-cards-rank'];
    if (rank > numberOfCards) classes.push('unused');
    if (toBeSelectedRanks.has(rank)) classes.push('selected orange-glow');
    return classes.join(' ');
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setSelectedRanks(toBeSelectedRanks);
    setTimeout(() => {
      setShowKnownCards(false);
      setIsLoading(false);
    }, 100);
  };

  const handleErase = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (toBeSelectedRanks.size > 0) {
      setToBeSelectedRanks(new Set());
    }
  };

  const handleClose = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setShowKnownCards(false);
  };

  return (
    <>
      {renderContainer && (
        <main
          className={`known-cards-overlay ${
            showKnownCards ? 'fade-in' : 'fade-out'
          }`}
        >
          <section
            ref={knownCardsContainerRef}
            className={`known-cards-container ${
              showKnownCards ? 'fade-in' : 'fade-out'
            }`}
          >
            <div className='portal-top-toggles'>
              {knownCardsEraserActive ? (
                <Tooltip
                  title={
                    <>
                      <p className='tooltip-text'>Clear selections</p>
                    </>
                  }
                  enterDelay={400}
                  placement='right'
                >
                  <EraserIcon
                    className={
                      knownCardsEraserActive
                        ? 'eraser-icon'
                        : 'eraser-icon-disabled'
                    }
                    onClick={knownCardsEraserActive ? handleErase : undefined}
                  />
                </Tooltip>
              ) : (
                <EraserIcon className='eraser-icon-disabled' />
              )}
              <XIcon className='x-icon' onClick={(e) => handleClose(e)} />
            </div>
            <header className='known-cards-header'>
              <p className='known-cards-header-text'>Settings</p>
            </header>
            <div className='known-cards-x-content'>
              <div
                className={`known-cards-x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 25
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(25)}
              >
                <p className='known-cards-x-value'>25</p>
              </div>
              <div
                className={`known-cards-x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 50
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(50)}
              >
                <p className='known-cards-x-value'>50</p>
              </div>
              <div
                className={`known-cards-x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 75
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(75)}
              >
                <p className='known-cards-x-value'>75</p>
              </div>
              <div
                className={`known-cards-x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 100
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(100)}
              >
                <p className='known-cards-x-value'>100</p>
              </div>
            </div>
            <p className='known-cards-header-subtext'>
              Select the rankings for cards you already know:
            </p>

            <div className='known-cards-grid'>
              {cardData.map((card) => (
                <div
                  key={card.rank}
                  className={getRankClass(card.rank!)}
                  onClick={() => handleRankSelection(card.rank!)}
                >
                  <span className='known-cards-rank-value'>{card.rank}</span>
                </div>
              ))}
            </div>

            <button
              className={`${
                knownCardsButtonActive ? 'guess-button' : 'inactive-button'
              }`}
              disabled={!knownCardsButtonActive}
              onClick={() => handleSubmit()}
            >
              {isLoading ? (
                <LinearProgress className='linear-progress' color='inherit' />
              ) : (
                'Save Settings'
              )}
            </button>
          </section>
        </main>
      )}
    </>
  );
};

export default KnownCards;
