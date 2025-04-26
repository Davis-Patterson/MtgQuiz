import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext, Player, WindowType } from 'Contexts/AppContext';
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
import CardNumberSlider from 'Components/Utils/CardNumberSlider';
import SortablePlayer from 'Components/Utils/SortablePlayer';
import XIcon from 'Svgs/XIcon';
import EraserIcon from 'Svgs/EraserIcon';
import LinearProgress from '@mui/material/LinearProgress';
import DropdownIcon from 'Svgs/DropdownIcon';
import BackArrow from 'Svgs/BackArrow';
import NotesIcon from 'Svgs/NotesIcon';
import TrophyIcon from 'Svgs/TrophyIcon';
import MailIcon from 'Svgs/MailIcon';
import Email from 'Components/Utils/Email';
import PatchNotes from 'Components/Utils/PatchNotes';
import InfoIcon from 'Svgs/InfoIcon';
import creatorQuizzes from 'Utilities/CGB-Quizzes-Season-1.json';
import Tooltip from '@mui/material/Tooltip';
import 'Styles/Utils/Settings.css';
import CreatorLeaderboard from './CreatorLeaderboard';

type DropdownType =
  | 'gameMode'
  | 'listYear'
  | 'creators'
  | 'cardNumber'
  | 'excludeCards'
  | 'includeCards'
  | 'participants'
  | null;

const Settings: React.FC = () => {
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('No Context');
  }
  const {
    defaultListYear,
    gameMode,
    setGameMode,
    players,
    setPlayers,
    cardData,
    listYear,
    setListYear,
    numberOfCards,
    setNumberOfCards,
    rangeOfQuiz,
    setRangeOfQuiz,
    creatorQuiz,
    setCreatorQuiz,
    showSettings,
    setShowSettings,
    settingsWindow,
    setSettingsWindow,
    excludedRanks,
    setExcludedRanks,
    includedRanks,
    setIncludedRanks,
    setCreatorRanks,
    creatorRanks,
    previousQuizRanks,
  } = appContext;

  const [renderContainer, setRenderContainer] = useState(false);

  const [settingsButtonActive, setSettingsButtonActive] = useState(false);
  const [excludeCardsEraserActive, setExcludeCardsEraserActive] =
    useState<boolean>(false);
  const [settingsEraserActive, setSettingsEraserActive] =
    useState<boolean>(false);
  const [includeCardsEraserActive, setIncludeCardsEraserActive] =
    useState<boolean>(false);
  const [alreadyExcludedRanks, setAlreadyExcludedRanks] = useState<Set<number>>(
    new Set(excludedRanks)
  );
  const [toBeExcludedRanks, setToBeExcludedRanks] = useState<Set<number>>(
    new Set(excludedRanks)
  );
  const [alreadyIncludedRanks, setAlreadyIncludedRanks] = useState<Set<number>>(
    new Set(includedRanks)
  );
  const [toBeIncludedRanks, setToBeIncludedRanks] = useState<Set<number>>(
    new Set(includedRanks)
  );
  const [initialGameMode, setInitialGameMode] = useState<string>('');
  const [initialListYear, setInitialListYear] =
    useState<number>(defaultListYear);
  const [initialPlayers, setInitialPlayers] = useState<Player[]>([]);
  const [initialRangeOfQuiz, setInitialRangeOfQuiz] = useState<number | null>(
    null
  );
  const [initialNumberOfCards, setInitialNumberOfCards] = useState<
    number | null
  >(null);
  const [initialCreatorRanks, setInitialCreatorRanks] = useState<Set<number>>(
    new Set()
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isCreatorLoading, setIsCreatorLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [newPlayerName, setNewPlayerName] = useState('');

  const settingsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSet = new Set(excludedRanks);
    setAlreadyExcludedRanks(newSet);
    setToBeExcludedRanks(newSet);
  }, [excludedRanks]);

  useEffect(() => {
    const newSet = new Set(includedRanks);
    setAlreadyIncludedRanks(newSet);
    setToBeIncludedRanks(newSet);
  }, [includedRanks]);

  useEffect(() => {
    if (showSettings) {
      setInitialRangeOfQuiz(rangeOfQuiz);
      setInitialGameMode(gameMode);
      setInitialListYear(listYear);
      setInitialNumberOfCards(numberOfCards);
      setInitialPlayers([...players]);
      const initialExcludedRanks = new Set(excludedRanks);
      setAlreadyExcludedRanks(initialExcludedRanks);
      setToBeExcludedRanks(initialExcludedRanks);
      const initialIncludedRanks = new Set(includedRanks);
      setAlreadyIncludedRanks(initialIncludedRanks);
      setToBeIncludedRanks(initialIncludedRanks);
      const initialCreatorRanks = new Set(creatorRanks);
      setInitialCreatorRanks(initialCreatorRanks);
    }
  }, [showSettings]);

  const hasChanges = () => {
    const xChanged = initialRangeOfQuiz !== rangeOfQuiz;
    const gameModeChanged = initialGameMode !== gameMode;
    const listYearChanged = initialListYear !== listYear;
    const numberOfCardsChanged = initialNumberOfCards !== numberOfCards;

    const excludedRanksChanged = !(
      alreadyExcludedRanks.size === toBeExcludedRanks.size &&
      [...alreadyExcludedRanks].every((rank) => toBeExcludedRanks.has(rank))
    );

    const includedRanksChanged = !(
      alreadyIncludedRanks.size === toBeIncludedRanks.size &&
      [...alreadyIncludedRanks].every((rank) => toBeIncludedRanks.has(rank))
    );

    const creatorRanksChanged = !(
      initialCreatorRanks.size === creatorRanks.size &&
      [...initialCreatorRanks].every((rank) => creatorRanks.has(rank))
    );
    const playersChanged =
      JSON.stringify(players) !== JSON.stringify(initialPlayers);

    return (
      xChanged ||
      gameModeChanged ||
      listYearChanged ||
      numberOfCardsChanged ||
      excludedRanksChanged ||
      includedRanksChanged ||
      creatorRanksChanged ||
      playersChanged
    );
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
        setActiveDropdown(null);
        setSettingsWindow('settings');
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
    const validSelected = Array.from(toBeExcludedRanks).filter(
      (rank) => rank <= rangeOfQuiz
    ).length;
    const availableCards = rangeOfQuiz - validSelected;
    const hasEnoughCards =
      availableCards >= numberOfCards &&
      toBeIncludedRanks.size <= numberOfCards;
    const hasOverlap = Array.from(toBeExcludedRanks).some((rank) =>
      toBeIncludedRanks.has(rank)
    );

    const hasValidChanges = hasChanges();

    setSettingsButtonActive(hasValidChanges && hasEnoughCards && !hasOverlap);
  }, [
    gameMode,
    listYear,
    toBeExcludedRanks,
    toBeIncludedRanks,
    creatorRanks,
    rangeOfQuiz,
    players,
    initialPlayers,
    numberOfCards,
  ]);

  useEffect(() => {
    const hasExcludedCards = toBeExcludedRanks.size > 0;
    setExcludeCardsEraserActive(hasExcludedCards);
  }, [toBeExcludedRanks]);

  useEffect(() => {
    const hasIncludedCards =
      toBeIncludedRanks.size > 0 || creatorRanks.size > 0;
    setIncludeCardsEraserActive(hasIncludedCards);
  }, [toBeIncludedRanks, creatorRanks]);

  useEffect(() => {
    const areSettingsDefault =
      gameMode === 'salt' &&
      rangeOfQuiz === 100 &&
      listYear === defaultListYear &&
      numberOfCards === 10 &&
      excludedRanks.size === 0 &&
      includedRanks.size === 0 &&
      creatorRanks.size === 0 &&
      creatorQuiz === '' &&
      players.length === 1 &&
      players[0].name === '' &&
      players[0].order === 1 &&
      players[0].scores.length === 0 &&
      toBeExcludedRanks.size === 0 &&
      toBeIncludedRanks.size === 0;

    setSettingsEraserActive(!areSettingsDefault);
  }, [
    gameMode,
    rangeOfQuiz,
    listYear,
    numberOfCards,
    excludedRanks,
    includedRanks,
    creatorRanks,
    creatorQuiz,
    players,
    toBeExcludedRanks,
    toBeIncludedRanks,
  ]);

  const handleRankExclusionSelection = (rank: number) => {
    if (rank > rangeOfQuiz) return;

    setToBeExcludedRanks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rank)) {
        newSet.delete(rank);
      } else {
        newSet.add(rank);
      }
      return newSet;
    });
  };

  const handleRankInclusionSelection = (rank: number) => {
    if (rank > rangeOfQuiz || creatorQuiz) return;

    setToBeIncludedRanks((prev) => {
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
    if (rangeOfQuiz === value) {
      setRangeOfQuiz(0);
    } else {
      setRangeOfQuiz(value);
    }
  };

  const getExcludedRankClass = (rank: number) => {
    const classes = ['settings-rank'];
    if (rank > rangeOfQuiz) classes.push('unused');
    if (toBeExcludedRanks.has(rank)) classes.push('selected orange-glow');
    return classes.join(' ');
  };

  const getIncludedRankClass = (rank: number) => {
    const classes = ['settings-rank'];
    if (creatorQuiz || rank > rangeOfQuiz) classes.push('unused');
    if (toBeIncludedRanks.has(rank) && !creatorQuiz)
      classes.push('selected orange-glow');
    return classes.join(' ');
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setExcludedRanks(toBeExcludedRanks);
    setIncludedRanks(toBeIncludedRanks);
    setCreatorRanks(creatorRanks);
    setTimeout(() => {
      setShowSettings(false);
      setIsLoading(false);
    }, 100);
    setActiveDropdown(null);
    setSettingsWindow('settings');
  };

  const handleClose = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setShowSettings(false);
    setActiveDropdown(null);
    setSettingsWindow('settings');
  };

  const toggleDropdown = (dropdown: DropdownType) => {
    setActiveDropdown((current) => (current === dropdown ? null : dropdown));
  };

  const handleSettingsErase = () => {
    if (creatorRanks.size > 0) {
      setIsCreatorLoading(true);
      setTimeout(() => {
        setIsCreatorLoading(false);
      }, 500);
    }

    setRangeOfQuiz(100);
    setGameMode('salt');
    setListYear(defaultListYear);
    setNumberOfCards(10);
    setExcludedRanks(new Set());
    setIncludedRanks(new Set());
    setCreatorRanks(new Set());
    setCreatorQuiz('');
    setPlayers([
      {
        id: uuidv4(),
        order: 1,
        name: '',
        scores: [],
      },
    ]);

    setToBeExcludedRanks(new Set());
    setToBeIncludedRanks(new Set());
  };

  const handleExclusionErase = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (toBeExcludedRanks.size > 0) {
      setToBeExcludedRanks(new Set());
    }
  };

  const handleInclusionErase = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (creatorRanks.size > 0) {
      setIsCreatorLoading(true);
      setTimeout(() => {
        setIsCreatorLoading(false);
      }, 500);
    }

    if (toBeIncludedRanks.size > 0 || creatorRanks.size > 0) {
      setToBeIncludedRanks(new Set());
      setCreatorRanks(new Set());
      setCreatorQuiz('');
    }
  };

  const handleExcludePreviousQuiz = () => {
    setToBeExcludedRanks((prev) => {
      const mergedRanks = new Set(prev);
      previousQuizRanks.forEach((rank) => mergedRanks.add(rank));
      return mergedRanks;
    });
  };

  const handleIncludePreviousQuiz = () => {
    setToBeIncludedRanks((prev) => {
      const mergedRanks = new Set(prev);
      previousQuizRanks.forEach((rank) => mergedRanks.add(rank));
      return mergedRanks;
    });
  };

  const handleCreatorQuiz = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsCreatorLoading(true);
    const selectedCreator = e.target.value;
    setCreatorQuiz(selectedCreator);

    if (selectedCreator) {
      const creator = creatorQuizzes.find((c) => c.creator === selectedCreator);
      if (creator) {
        setGameMode('salt');
        setCreatorRanks(new Set(creator.cards));
        setToBeIncludedRanks(new Set());
        setToBeExcludedRanks(new Set());
        setRangeOfQuiz(100);
        setNumberOfCards(10);
      }
    } else {
      setCreatorRanks(new Set());
    }
    setTimeout(() => {
      setIsCreatorLoading(false);
    }, 500);
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

  const handleSettingsWindow = (windowType: WindowType) => {
    setSettingsWindow(windowType);
    setActiveDropdown(null);
  };

  const handleSetListYear = (year: number) => {
    setListYear(year);
  };

  const handleSetGameMode = (mode: string) => {
    setGameMode(mode);
    if (mode === 'shift') {
      setRangeOfQuiz(100);
    }
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
              {settingsWindow === 'settings' &&
                (settingsEraserActive ? (
                  <Tooltip
                    title={
                      <>
                        <div className='tooltip-text-container'>
                          <p className='tooltip-text'>Reset settings</p>
                        </div>
                      </>
                    }
                    enterDelay={600}
                    placement='right'
                  >
                    <EraserIcon
                      className='eraser-icon'
                      onClick={
                        settingsEraserActive ? handleSettingsErase : undefined
                      }
                    />
                  </Tooltip>
                ) : (
                  <EraserIcon className='eraser-icon-disabled' />
                ))}
              {(settingsWindow === 'contact' ||
                settingsWindow === 'notes' ||
                settingsWindow === 'leaderboard') && (
                <BackArrow
                  className='settings-back-arrow'
                  onClick={() => handleSettingsWindow('settings')}
                />
              )}
              {settingsWindow === 'settings' && (
                <>
                  <Tooltip
                    title={
                      <>
                        <div className='tooltip-text-container'>
                          <p className='tooltip-text'>Patch notes</p>
                        </div>
                      </>
                    }
                    enterDelay={600}
                    placement='right'
                  >
                    <NotesIcon
                      className='settings-notes-icon'
                      onClick={() => handleSettingsWindow('notes')}
                    />
                  </Tooltip>
                  <Tooltip
                    title={
                      <>
                        <div className='tooltip-text-container'>
                          <p className='tooltip-text'>Message developers</p>
                        </div>
                      </>
                    }
                    enterDelay={600}
                    placement='right'
                  >
                    <MailIcon
                      className='settings-mail-icon'
                      onClick={() => handleSettingsWindow('contact')}
                    />
                  </Tooltip>
                  <Tooltip
                    title={
                      <>
                        <div className='tooltip-text-container'>
                          <p className='tooltip-text'>Creator Leaderboard</p>
                        </div>
                      </>
                    }
                    enterDelay={600}
                    placement='right'
                  >
                    <TrophyIcon
                      className='settings-trophy-icon'
                      onClick={() => handleSettingsWindow('leaderboard')}
                    />
                  </Tooltip>
                </>
              )}
              <XIcon className='x-icon' onClick={(e) => handleClose(e)} />
            </div>
            {settingsWindow === 'settings' && (
              <>
                <div className='settings-window'>
                  <header className='settings-header'>
                    <p className='settings-header-text'>Settings</p>
                  </header>
                  <p className='settings-header-subtext'>
                    Select a value for X
                  </p>
                  <p className='settings-header-sub-subtext'>
                    The range of cards from which your quiz will be drawn from
                  </p>
                  {creatorQuiz || gameMode === 'shift' ? (
                    <Tooltip
                      title={
                        <>
                          <div className='tooltip-text-container'>
                            <p className='tooltip-text'>Disabled under</p>
                            <p className='tooltip-text'>current settings</p>
                          </div>
                        </>
                      }
                      enterDelay={400}
                      placement='top'
                    >
                      <div className='settings-x-content disabled'>
                        <div className='settings-x-container-disabled unselected'>
                          <p className='settings-x-value'>25</p>
                        </div>
                        <div className='settings-x-container-disabled unselected'>
                          <p className='settings-x-value'>50</p>
                        </div>
                        <div className='settings-x-container-disabled unselected'>
                          <p className='settings-x-value'>75</p>
                        </div>
                        <div className='settings-x-container-disabled selected blue-glow'>
                          <p className='settings-x-value'>100</p>
                        </div>
                      </div>
                    </Tooltip>
                  ) : (
                    <div className='settings-x-content'>
                      <div
                        className={`settings-x-container ${
                          rangeOfQuiz === 0
                            ? ''
                            : rangeOfQuiz === 25
                            ? 'selected blue-glow'
                            : 'unselected'
                        }`}
                        onClick={() => handleCardNumber(25)}
                      >
                        <p className='settings-x-value'>25</p>
                      </div>
                      <div
                        className={`settings-x-container ${
                          rangeOfQuiz === 0
                            ? ''
                            : rangeOfQuiz === 50
                            ? 'selected blue-glow'
                            : 'unselected'
                        }`}
                        onClick={() => handleCardNumber(50)}
                      >
                        <p className='settings-x-value'>50</p>
                      </div>
                      <div
                        className={`settings-x-container ${
                          rangeOfQuiz === 0
                            ? ''
                            : rangeOfQuiz === 75
                            ? 'selected blue-glow'
                            : 'unselected'
                        }`}
                        onClick={() => handleCardNumber(75)}
                      >
                        <p className='settings-x-value'>75</p>
                      </div>
                      <div
                        className={`settings-x-container ${
                          rangeOfQuiz === 0
                            ? ''
                            : rangeOfQuiz === 100
                            ? 'selected blue-glow'
                            : 'unselected'
                        }`}
                        onClick={() => handleCardNumber(100)}
                      >
                        <p className='settings-x-value'>100</p>
                      </div>
                    </div>
                  )}

                  <div className='settings-dropdowns'>
                    <div className='settings-dropdown'>
                      <div
                        className='settings-dropdown-header'
                        onClick={() => toggleDropdown('gameMode')}
                      >
                        <div className='settings-dropdown-header-text-container'>
                          <p className='settings-dropdown-header-text'>
                            Select quiz mode
                          </p>
                        </div>
                        <div className='settings-header-dropdown-icon'>
                          {activeDropdown === 'gameMode' ? (
                            <DropdownIcon className='down-icon' />
                          ) : (
                            <DropdownIcon className='up-icon' />
                          )}
                        </div>
                      </div>

                      {activeDropdown === 'gameMode' && (
                        <div className='settings-dropdown-contents'>
                          <p className='settings-dropdown-header-subtext'>
                            Choose a quiz mode
                          </p>
                          <div className='settings-dropdown-mode-container'>
                            <div
                              className={`settings-year-container ${
                                gameMode === 'salt'
                                  ? 'active blue-glow'
                                  : 'inactive'
                              }`}
                              onClick={() => handleSetGameMode('salt')}
                            >
                              <p
                                className={`settings-year ${
                                  gameMode === 'salt' ? 'active' : 'inactive'
                                }`}
                              >
                                Salt Quiz
                              </p>
                            </div>
                            <div
                              className={`settings-year-container ${
                                gameMode === 'shift'
                                  ? 'active blue-glow'
                                  : 'inactive'
                              }`}
                              onClick={() => handleSetGameMode('shift')}
                            >
                              <p
                                className={`settings-year ${
                                  gameMode === 'shift' ? 'active' : 'inactive'
                                }`}
                              >
                                Salt Shift
                              </p>
                            </div>
                          </div>
                          <div className='settings-dropdown-mode-description-container'>
                            {gameMode === 'salt' ? (
                              <p className='settings-dropdown-mode-description'>
                                Salt Quiz challenges players to guess the exact
                                ranking of cards. Players score points based on
                                how close their guess is to the actual rank -
                                the smaller the difference between the guess and
                                the actual rank, the better the score.
                              </p>
                            ) : (
                              <p className='settings-dropdown-mode-description'>
                                Salt Shift focuses on year-over-year rank
                                changes. Players will see a card's rank from the
                                previous year and must determine if its rank
                                increased or decreased in the latest list. A
                                smaller number indicates a greater rank. Points
                                are awarded for correct guesses.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {gameMode === 'salt' && (
                      <>
                        <div className='settings-dropdown'>
                          <div
                            className='settings-dropdown-header'
                            onClick={() => toggleDropdown('listYear')}
                          >
                            <div className='settings-dropdown-header-text-container'>
                              <p className='settings-dropdown-header-text'>
                                Select salt lists by year
                              </p>
                            </div>
                            <div className='settings-header-dropdown-icon'>
                              {activeDropdown === 'listYear' ? (
                                <DropdownIcon className='down-icon' />
                              ) : (
                                <DropdownIcon className='up-icon' />
                              )}
                            </div>
                          </div>

                          {activeDropdown === 'listYear' && (
                            <div className='settings-dropdown-contents'>
                              <p className='settings-dropdown-header-subtext'>
                                Choose which year's saltiest cards list to use
                                for your quiz
                              </p>
                              <div className='settings-dropdown-years-container'>
                                <div
                                  className={`settings-year-container ${
                                    listYear === 2024
                                      ? 'active blue-glow'
                                      : 'inactive'
                                  }`}
                                  onClick={() => handleSetListYear(2024)}
                                >
                                  <p
                                    className={`settings-year ${
                                      listYear === 2024 ? 'active' : 'inactive'
                                    }`}
                                  >
                                    2024
                                  </p>
                                </div>
                                <div
                                  className={`settings-year-container ${
                                    listYear === 2023
                                      ? 'active blue-glow'
                                      : 'inactive'
                                  }`}
                                  onClick={() => handleSetListYear(2023)}
                                >
                                  <p
                                    className={`settings-year ${
                                      listYear === 2023 ? 'active' : 'inactive'
                                    }`}
                                  >
                                    2023
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {gameMode === 'salt' && (
                      <>
                        <div className='settings-dropdown'>
                          <div
                            className='settings-dropdown-header'
                            onClick={() => toggleDropdown('creators')}
                          >
                            <div className='settings-dropdown-header-text-container'>
                              <p className='settings-dropdown-header-text'>
                                Creator quizzes
                              </p>
                            </div>
                            <div className='settings-header-dropdown-icon'>
                              {activeDropdown === 'creators' ? (
                                <DropdownIcon className='down-icon' />
                              ) : (
                                <DropdownIcon className='up-icon' />
                              )}
                            </div>
                          </div>

                          {activeDropdown === 'creators' && (
                            <div className='settings-dropdown-contents'>
                              <p className='settings-dropdown-header-subtext'>
                                Recreate past quizzes taken by creators
                              </p>
                              <div className='settings-creator-quiz-header '>
                                {isCreatorLoading ? (
                                  <div className='creator-dropdown'>
                                    <LinearProgress
                                      className='linear-progress'
                                      color='inherit'
                                    />
                                  </div>
                                ) : (
                                  <select
                                    className='creator-dropdown'
                                    value={creatorQuiz}
                                    onChange={(e) => handleCreatorQuiz(e)}
                                  >
                                    <option value=''>
                                      {toBeIncludedRanks.size > 0
                                        ? 'Custom'
                                        : 'Select a creator quiz'}
                                    </option>
                                    {creatorQuizzes.map((quiz) => (
                                      <option
                                        key={quiz.creator}
                                        value={quiz.creator}
                                      >
                                        {quiz.creator}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                <Tooltip
                                  title={
                                    <>
                                      <div className='tooltip-text-container'>
                                        <p className='tooltip-text'>
                                          Clear selections
                                        </p>
                                      </div>
                                    </>
                                  }
                                  enterDelay={400}
                                  placement='top'
                                >
                                  <span>
                                    <button
                                      className='eraser-button'
                                      disabled={!includeCardsEraserActive}
                                      onClick={
                                        includeCardsEraserActive
                                          ? handleInclusionErase
                                          : undefined
                                      }
                                    >
                                      <EraserIcon className='eraser-button-icon' />
                                    </button>
                                  </span>
                                </Tooltip>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <>
                      <div className='settings-dropdown'>
                        <div
                          className='settings-dropdown-header'
                          onClick={() => toggleDropdown('cardNumber')}
                        >
                          <div className='settings-dropdown-header-text-container'>
                            <p className='settings-dropdown-header-text'>
                              Adjust the length of your quiz
                            </p>
                          </div>
                          <div className='settings-header-dropdown-icon'>
                            {activeDropdown === 'cardNumber' ? (
                              <DropdownIcon className='down-icon' />
                            ) : (
                              <DropdownIcon className='up-icon' />
                            )}
                          </div>
                        </div>

                        {activeDropdown === 'cardNumber' && (
                          <div className='settings-dropdown-contents'>
                            <p className='settings-dropdown-header-subtext'>
                              Modify the number of cards in your quiz
                            </p>
                            <CardNumberSlider />
                          </div>
                        )}
                      </div>
                    </>

                    {gameMode === 'salt' && (
                      <>
                        <div className='settings-dropdown'>
                          <div
                            className='settings-dropdown-header'
                            onClick={() => toggleDropdown('excludeCards')}
                          >
                            <div className='settings-dropdown-header-text-container'>
                              <p className='settings-dropdown-header-text'>
                                Select rankings to be excluded from quiz
                              </p>
                            </div>
                            <div className='settings-header-dropdown-icon'>
                              {activeDropdown === 'excludeCards' ? (
                                <DropdownIcon className='down-icon' />
                              ) : (
                                <DropdownIcon className='up-icon' />
                              )}
                            </div>
                          </div>

                          {activeDropdown === 'excludeCards' && (
                            <div className='settings-dropdown-contents'>
                              <div className='settings-known-cards-header '>
                                {creatorQuiz ? (
                                  <Tooltip
                                    title={
                                      <>
                                        <div className='tooltip-text-container'>
                                          <p className='tooltip-text'>
                                            Disabled while creator
                                          </p>
                                          <p className='tooltip-text'>
                                            quiz is selected
                                          </p>
                                        </div>
                                      </>
                                    }
                                    enterDelay={400}
                                    placement='top'
                                  >
                                    <span>
                                      <button
                                        disabled={true}
                                        className='exclude-cards-button-disabled'
                                      >
                                        Select Previous Quiz
                                      </button>
                                    </span>
                                  </Tooltip>
                                ) : (
                                  <Tooltip
                                    title={
                                      <>
                                        <div className='tooltip-text-container'>
                                          <p className='tooltip-text'>
                                            Select cards seen in
                                          </p>
                                          <p className='tooltip-text'>
                                            previous quiz, when
                                          </p>
                                          <p className='tooltip-text'>
                                            applicable
                                          </p>
                                        </div>
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
                                )}
                                <Tooltip
                                  title={
                                    <>
                                      <div className='tooltip-text-container'>
                                        <p className='tooltip-text'>
                                          Clear selections
                                        </p>
                                      </div>
                                    </>
                                  }
                                  enterDelay={400}
                                  placement='top'
                                >
                                  <span>
                                    <button
                                      className='eraser-button'
                                      disabled={!excludeCardsEraserActive}
                                      onClick={
                                        excludeCardsEraserActive
                                          ? handleExclusionErase
                                          : undefined
                                      }
                                    >
                                      <EraserIcon className='eraser-button-icon' />
                                    </button>
                                  </span>
                                </Tooltip>
                              </div>
                              <p className='settings-dropdown-header-subtext'>
                                Ranks selected here will be excluded from the
                                quiz
                              </p>
                              <div className='settings-known-cards-grid'>
                                {cardData.map((card) =>
                                  creatorQuiz ? (
                                    <Tooltip
                                      key={card.rank}
                                      title={
                                        <>
                                          <div className='tooltip-text-container'>
                                            <p className='tooltip-text'>
                                              Disabled while creator
                                            </p>
                                            <p className='tooltip-text'>
                                              quiz is selected
                                            </p>
                                          </div>
                                        </>
                                      }
                                      enterDelay={400}
                                      placement='top'
                                    >
                                      <div className='grid-circle-container'>
                                        <div className='settings-rank unused'>
                                          <span className='settings-rank-value'>
                                            {card.rank}
                                          </span>
                                        </div>
                                      </div>
                                    </Tooltip>
                                  ) : (
                                    <div
                                      key={card.rank}
                                      className='grid-circle-container'
                                    >
                                      <div
                                        className={getExcludedRankClass(
                                          card.rank!
                                        )}
                                        onClick={() =>
                                          handleRankExclusionSelection(
                                            card.rank!
                                          )
                                        }
                                      >
                                        <span className='settings-rank-value'>
                                          {card.rank}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {gameMode === 'salt' && (
                      <>
                        <div className='settings-dropdown'>
                          <div
                            className='settings-dropdown-header'
                            onClick={() => toggleDropdown('includeCards')}
                          >
                            <div className='settings-dropdown-header-text-container'>
                              <p className='settings-dropdown-header-text'>
                                Select rankings to be included in the quiz
                              </p>
                            </div>
                            <div className='settings-header-dropdown-icon'>
                              {activeDropdown === 'includeCards' ? (
                                <DropdownIcon className='down-icon' />
                              ) : (
                                <DropdownIcon className='up-icon' />
                              )}
                            </div>
                          </div>

                          {activeDropdown === 'includeCards' && (
                            <div className='settings-dropdown-contents'>
                              <div className='settings-known-cards-header '>
                                {creatorQuiz ? (
                                  <Tooltip
                                    title={
                                      <>
                                        <div className='tooltip-text-container'>
                                          <p className='tooltip-text'>
                                            Disabled while creator
                                          </p>
                                          <p className='tooltip-text'>
                                            quiz is selected
                                          </p>
                                        </div>
                                      </>
                                    }
                                    enterDelay={400}
                                    placement='top'
                                  >
                                    <span>
                                      <button
                                        disabled={true}
                                        className='exclude-cards-button-disabled'
                                      >
                                        Retake Previous Quiz
                                      </button>
                                    </span>
                                  </Tooltip>
                                ) : (
                                  <Tooltip
                                    title={
                                      <>
                                        <div className='tooltip-text-container'>
                                          <p className='tooltip-text'>
                                            Select cards seen in
                                          </p>
                                          <p className='tooltip-text'>
                                            previous quiz, when
                                          </p>
                                          <p className='tooltip-text'>
                                            applicable
                                          </p>
                                        </div>
                                      </>
                                    }
                                    enterDelay={400}
                                    placement='top'
                                  >
                                    <span>
                                      <button
                                        onClick={handleIncludePreviousQuiz}
                                        disabled={previousQuizRanks.size === 0}
                                        className='exclude-cards-button'
                                      >
                                        Retake Previous Quiz
                                      </button>
                                    </span>
                                  </Tooltip>
                                )}
                                <Tooltip
                                  title={
                                    <>
                                      <div className='tooltip-text-container'>
                                        <p className='tooltip-text'>
                                          Clear selections
                                        </p>
                                      </div>
                                    </>
                                  }
                                  enterDelay={400}
                                  placement='top'
                                >
                                  <span>
                                    <button
                                      className='eraser-button'
                                      disabled={!includeCardsEraserActive}
                                      onClick={
                                        includeCardsEraserActive
                                          ? handleInclusionErase
                                          : undefined
                                      }
                                    >
                                      <EraserIcon className='eraser-button-icon' />
                                    </button>
                                  </span>
                                </Tooltip>
                              </div>
                              <p className='settings-dropdown-header-subtext'>
                                Ranks selected here will be included in the quiz
                              </p>
                              <div className='settings-known-cards-grid'>
                                {cardData.map((card) =>
                                  creatorQuiz ? (
                                    <Tooltip
                                      key={card.rank}
                                      title={
                                        <>
                                          <div className='tooltip-text-container'>
                                            <p className='tooltip-text'>
                                              Disabled while creator
                                            </p>
                                            <p className='tooltip-text'>
                                              quiz is selected
                                            </p>
                                          </div>
                                        </>
                                      }
                                      enterDelay={400}
                                      placement='top'
                                    >
                                      <div className='grid-circle-container'>
                                        <div className='settings-rank unused'>
                                          <span className='settings-rank-value'>
                                            {card.rank}
                                          </span>
                                        </div>
                                      </div>
                                    </Tooltip>
                                  ) : (
                                    <div
                                      key={card.rank}
                                      className='grid-circle-container'
                                    >
                                      <div
                                        className={getIncludedRankClass(
                                          card.rank!
                                        )}
                                        onClick={() =>
                                          handleRankInclusionSelection(
                                            card.rank!
                                          )
                                        }
                                      >
                                        <span className='settings-rank-value'>
                                          {card.rank}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className='settings-dropdown'>
                      <div
                        className='settings-dropdown-header'
                        onClick={() => toggleDropdown('participants')}
                      >
                        <div className='settings-dropdown-header-text-container'>
                          <p className='settings-dropdown-header-text'>
                            Add or remove participants from the quiz
                          </p>
                        </div>
                        <div className='settings-header-dropdown-icon'>
                          {activeDropdown === 'participants' ? (
                            <DropdownIcon className='down-icon' />
                          ) : (
                            <DropdownIcon className='up-icon' />
                          )}
                        </div>
                      </div>

                      {activeDropdown === 'participants' && (
                        <div className='settings-dropdown-contents'>
                          <div className='settings-participants-content'>
                            <div className='settings-participants-header'>
                              <Tooltip
                                title={
                                  <>
                                    <div className='tooltip-text-container'>
                                      <p className='tooltip-text'>
                                        Multiplayer is limited to a single
                                        device.
                                      </p>
                                      <p className='tooltip-text'>
                                        No online or cross-device play available
                                        at this time.
                                      </p>
                                    </div>
                                  </>
                                }
                                enterDelay={400}
                                placement='top'
                              >
                                <div className='settings-participants-header-container'>
                                  <p className='settings-dropdown-info-text'>
                                    Local multiplayer only
                                  </p>
                                  <div className='info-icon-container'>
                                    <InfoIcon className='info-icon' />
                                  </div>
                                </div>
                              </Tooltip>
                            </div>
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
                                  onChange={(e) =>
                                    setNewPlayerName(e.target.value)
                                  }
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
                      <LinearProgress
                        className='linear-progress'
                        color='inherit'
                      />
                    ) : creatorQuiz ? (
                      `Save ${creatorQuiz} Settings`
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                </div>
              </>
            )}
            {settingsWindow === 'leaderboard' && (
              <>
                <div className='settings-window'>
                  <header className='settings-contact-header'>
                    <p className='settings-alt-header-text'>Leaderboard</p>
                  </header>
                  <p className='settings-header-contact-subtext'>
                    Current CovertGoSalt leaderboards
                  </p>
                  <CreatorLeaderboard />
                </div>
              </>
            )}
            {settingsWindow === 'notes' && (
              <>
                <div className='settings-window'>
                  <header className='settings-contact-header'>
                    <p className='settings-alt-header-text'>Patch Notes</p>
                  </header>
                  <p className='settings-header-contact-subtext'>
                    Information on application updates
                  </p>
                  <PatchNotes />
                </div>
              </>
            )}
            {settingsWindow === 'contact' && (
              <>
                <div className='settings-window'>
                  <header className='settings-contact-header'>
                    <p className='settings-alt-header-text'>Contact</p>
                  </header>
                  <p className='settings-header-contact-subtext'>
                    Send a message to the developers
                  </p>
                  <Email />
                </div>
              </>
            )}
          </section>
        </main>
      )}
    </>
  );
};

export default Settings;
