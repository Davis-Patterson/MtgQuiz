import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext, Player } from 'Contexts/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import SortablePlayer from 'Components/Utils/SortablePlayer';
import XIcon from 'Svgs/XIcon';
import EraserIcon from 'Svgs/EraserIcon';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import DropdownIcon from 'Svgs/DropdownIcon';
import 'Styles/Utils/Settings.css';

const Settings: React.FC = () => {
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('No Context');
  }
  const {
    players,
    setPlayers,
    cardData,
    numberOfCards,
    setNumberOfCards,
    showSettings,
    setShowSettings,
    selectedRanks,
    setSelectedRanks,
    previousQuizRanks,
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
  const [initialPlayers, setInitialPlayers] = useState<Player[]>([]);
  const [initialNumberOfCards, setInitialNumberOfCards] = useState<
    number | null
  >(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showKnownCards, setShowKnownCards] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const [newPlayerName, setNewPlayerName] = useState('');

  const settingsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSet = new Set(selectedRanks);
    setAlreadySelectedRanks(newSet);
    setToBeSelectedRanks(newSet);
  }, [selectedRanks]);

  useEffect(() => {
    if (showSettings) {
      setInitialNumberOfCards(numberOfCards);
      setInitialPlayers([...players]);
      const initialRanks = new Set(selectedRanks);
      setAlreadySelectedRanks(initialRanks);
      setToBeSelectedRanks(initialRanks);
    }
  }, [showSettings]);

  const hasChanges = () => {
    const xChanged = initialNumberOfCards !== numberOfCards;

    const rankChanged = !(
      alreadySelectedRanks.size === toBeSelectedRanks.size &&
      [...alreadySelectedRanks].every((rank) => toBeSelectedRanks.has(rank))
    );

    const playersChanged =
      JSON.stringify(players) !== JSON.stringify(initialPlayers);

    return xChanged || rankChanged || playersChanged;
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
        setShowKnownCards(false);
        setShowParticipants(false);
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

    const hasValidChanges = hasChanges();

    setSettingsButtonActive(hasValidChanges && hasEnoughCards);
  }, [toBeSelectedRanks, numberOfCards, players, initialPlayers]);

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

  const handleClose = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setShowSettings(false);
    setShowKnownCards(false);
    setShowParticipants(false);
  };

  const handleShowKnownCards = () => {
    if (!showKnownCards) {
      setShowKnownCards(true);
      setShowParticipants(false);
    } else {
      setShowKnownCards(false);
    }
  };

  const handleShowParticipants = () => {
    if (!showParticipants) {
      setShowParticipants(true);
      setShowKnownCards(false);
    } else {
      setShowParticipants(false);
    }
  };

  const handleErase = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (toBeSelectedRanks.size > 0) {
      setToBeSelectedRanks(new Set());
    }
  };

  const handleExcludePreviousQuiz = () => {
    setToBeSelectedRanks((prev) => {
      const mergedRanks = new Set(prev);
      previousQuizRanks.forEach((rank) => mergedRanks.add(rank));
      return mergedRanks;
    });
  };

  const addPlayer = () => {
    const newOrder = players.length + 1;
    const playerName = newPlayerName.trim() || '';
    const newPlayer = {
      id: uuidv4(),
      order: newOrder,
      name: playerName,
      scores: [],
    };
    setPlayers((prev) => [...prev, newPlayer]);
    setNewPlayerName('');
  };

  const handleDragEnd = (event: { active: any; over: any }) => {
    const { active, over } = event;
    if (!over) return;

    setPlayers((currentPlayers) => {
      const sortedPlayers = [...currentPlayers].sort(
        (a, b) => a.order - b.order
      );

      const oldIndex = sortedPlayers.findIndex((p) => p.id === active.id);
      const newIndex = sortedPlayers.findIndex((p) => p.id === over.id);

      const newSortedPlayers = arrayMove(sortedPlayers, oldIndex, newIndex);

      return newSortedPlayers.map((player, index) => ({
        ...player,
        order: index + 1,
      }));
    });
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
              <XIcon className='x-icon' onClick={(e) => handleClose(e)} />
            </div>
            <header className='settings-header'>
              <p className='settings-header-text'>Settings</p>
            </header>
            <p className='settings-header-subtext'>Select a value for X</p>
            <p className='settings-header-sub-subtext'>
              This value represents the range of ranks in your quiz
            </p>
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

            <div className='settings-dropdowns'>
              <div className='settings-dropdown'>
                <div
                  className='settings-dropdown-header'
                  onClick={() => handleShowKnownCards()}
                >
                  <div className='settings-dropdown-header-text-container'>
                    <p className='settings-dropdown-header-text'>
                      Select rankings for cards you already know
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

                {showKnownCards && (
                  <div className='settings-dropdown-contents'>
                    <div className='settings-known-cards-header '>
                      <Tooltip
                        title={
                          <>
                            <p className='tooltip-text'>Select cards seen in</p>
                            <p className='tooltip-text'>previous quiz</p>
                          </>
                        }
                        enterDelay={400}
                        placement='top'
                      >
                        <span>
                          <button
                            onClick={handleExcludePreviousQuiz}
                            disabled={previousQuizRanks.size === 0}
                            className='exclude-cards-button'
                          >
                            Select Previous Quiz
                          </button>
                        </span>
                      </Tooltip>
                      <Tooltip
                        title={
                          <>
                            <p className='tooltip-text'>Clear selections</p>
                          </>
                        }
                        enterDelay={400}
                        placement='top'
                      >
                        <span>
                          <button
                            className='eraser-button'
                            disabled={!knownCardsEraserActive}
                            onClick={
                              knownCardsEraserActive ? handleErase : undefined
                            }
                          >
                            <EraserIcon className='eraser-icon' />
                          </button>
                        </span>
                      </Tooltip>
                    </div>
                    <p className='settings-dropdown-header-subtext'>
                      Ranks selected here will be excluded from the quiz
                    </p>
                    <div className='settings-known-cards-grid'>
                      {cardData.map((card) => (
                        <div key={card.rank} className='grid-circle-container'>
                          <div
                            className={getRankClass(card.rank!)}
                            onClick={() => handleRankSelection(card.rank!)}
                          >
                            <span className='settings-rank-value'>
                              {card.rank}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='settings-dropdown'>
                <div
                  className='settings-dropdown-header'
                  onClick={() => handleShowParticipants()}
                >
                  <div className='settings-dropdown-header-text-container'>
                    <p className='settings-dropdown-header-text'>
                      Add or remove participants from the quiz
                    </p>
                  </div>
                  <div className='settings-header-dropdown-icon'>
                    {showParticipants ? (
                      <DropdownIcon className='down-icon' />
                    ) : (
                      <DropdownIcon className='up-icon' />
                    )}
                  </div>
                </div>

                {showParticipants && (
                  <div className='settings-dropdown-contents'>
                    <div className='settings-participants-content'>
                      <p className='settings-dropdown-header-subtext'>
                        Local multiplayer only
                      </p>
                      <div className='settings-add-participants'>
                        <DndContext
                          collisionDetection={closestCenter}
                          modifiers={[
                            restrictToVerticalAxis,
                            restrictToParentElement,
                          ]}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={players
                              .sort((a, b) => a.order - b.order)
                              .map((p) => p.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className='participants-list'>
                              {players
                                .sort((a, b) => a.order - b.order)
                                .map((player) => (
                                  <SortablePlayer
                                    key={player.id}
                                    player={player}
                                  />
                                ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                        <div className='add-player-section'>
                          <input
                            type='text'
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder={`Player ${players.length + 1}`}
                            className='participant-input'
                          />
                          <button
                            className='add-player-button'
                            onClick={addPlayer}
                          >
                            + Add Player
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
