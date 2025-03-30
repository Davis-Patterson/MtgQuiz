import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from 'Contexts/AppContext';
import XIcon from 'Svgs/XIcon';
import EraserIcon from 'Svgs/EraserIcon';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import 'Styles/Utils/Settings.css';
import DropdownIcon from 'Svgs/DropdownIcon';

const Settings: React.FC = () => {
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('No Context');
  }
  const {
    cardData,
    numberOfCards,
    setNumberOfCards,
    showSettings,
    setShowSettings,
    selectedRanks,
    setSelectedRanks,
  } = appContext;

  const [renderContainer, setRenderContainer] = useState(false);

  const [settingsButtonActive, setSettingsButtonActive] = useState(false);
  const [knownCardsEraserActive, setKnownCardsEraserActive] = useState(false);
  const [alreadySelectedRanks, setAlreadySelectedRanks] = useState<Set<number>>(
    new Set(selectedRanks)
  );
  const [toBeSelectedRanks, setToBeSelectedRanks] = useState<Set<number>>(
    new Set(selectedRanks)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [showKnownCards, setShowKnownCards] = useState(false);

  const settingsContainerRef = useRef<HTMLDivElement>(null);

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
    if (showSettings) {
      setRenderContainer(true);
    } else {
      const timer = setTimeout(() => {
        setRenderContainer(false);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [showSettings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsContainerRef.current &&
        !settingsContainerRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings, setShowSettings]);

  useEffect(() => {
    const validSelected = Array.from(toBeSelectedRanks).filter(
      (rank) => rank <= numberOfCards
    ).length;
    const availableCards = numberOfCards - validSelected;
    const hasEnoughCards = availableCards >= 10;

    setSettingsButtonActive(hasChanges() && hasEnoughCards);
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
    const classes = ['settings-rank'];
    if (rank > numberOfCards) classes.push('unused');
    if (toBeSelectedRanks.has(rank)) classes.push('selected orange-glow');
    return classes.join(' ');
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setSelectedRanks(toBeSelectedRanks);
    setTimeout(() => {
      setShowSettings(false);
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

    setShowSettings(false);
  };

  const handleShowKnownCards = () => {
    setShowKnownCards(!showKnownCards);
  };

  return (
    <>
      {renderContainer && (
        <main
          className={`settings-overlay ${
            showSettings ? 'fade-in' : 'fade-out'
          }`}
        >
          <section
            ref={settingsContainerRef}
            className={`settings-container ${
              showSettings ? 'fade-in' : 'fade-out'
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
            <header className='settings-header'>
              <p className='settings-header-text'>Settings</p>
            </header>
            <div className='settings-x-content'>
              <div
                className={`settings-x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 25
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(25)}
              >
                <p className='settings-x-value'>25</p>
              </div>
              <div
                className={`settings-x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 50
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(50)}
              >
                <p className='settings-x-value'>50</p>
              </div>
              <div
                className={`settings-x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 75
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(75)}
              >
                <p className='settings-x-value'>75</p>
              </div>
              <div
                className={`settings-x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 100
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(100)}
              >
                <p className='settings-x-value'>100</p>
              </div>
            </div>

            <div className='settings-dropdown'>
              <div
                className='settings-dropdown-header'
                onClick={() => handleShowKnownCards()}
              >
                <div className='settings-dropdown-header-text'>
                  <p className='settings-header-subtext'>
                    Select the rankings for cards you already know
                  </p>
                </div>
                <div className='settings-header-dropdown-icon'>
                  {showKnownCards ? (
                    <DropdownIcon className='down-icon' />
                  ) : (
                    <DropdownIcon className='up-icon' />
                  )}
                </div>
              </div>

              <div
                className='settings-dropdown-contents'
                style={{
                  height: showKnownCards ? 'auto' : '0px',
                  border: showKnownCards
                    ? '1px solid var(--clr-divider)'
                    : 'none',
                }}
              >
                <div className='settings-known-cards-grid'>
                  {cardData.map((card) => (
                    <div
                      key={card.rank}
                      className={getRankClass(card.rank!)}
                      onClick={() => handleRankSelection(card.rank!)}
                    >
                      <span className='settings-rank-value'>{card.rank}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              className={`${
                settingsButtonActive ? 'guess-button' : 'inactive-button'
              }`}
              disabled={!settingsButtonActive}
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

export default Settings;
