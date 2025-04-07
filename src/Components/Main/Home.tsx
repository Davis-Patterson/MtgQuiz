import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from 'Contexts/AppContext';
import { Link } from 'react-router-dom';
import SaltLogo from 'Assets/Images/salt-logo.webp';
import GearIcon from 'Svgs/GearIcon';
import Tooltip from '@mui/material/Tooltip';
import 'Styles/Main/Home.css';

const Home: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {
    gameMode,
    cardData,
    setPlayers,
    setCurrentIndex,
    rangeOfQuiz,
    setRangeOfQuiz,
    creatorQuiz,
    setCurrentCardGuesses,
    setRevealedRanks,
    setStarted,
    setIsSubmitted,
    setShowSettings,
    setCanScroll,
    setSettingsWindow,
  } = context;

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [enoughCards, setEnoughCards] = useState(false);

  const handleStart = () => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        scores: [],
      }))
    );
    setStarted(false);
    setIsSubmitted(false);
    setCurrentIndex(0);
    setCurrentCardGuesses({});
    setRevealedRanks([]);
    setCanScroll(true);
  };

  const handleCardNumber = (value: number) => {
    if (rangeOfQuiz === value) {
      setRangeOfQuiz(0);
    } else {
      setRangeOfQuiz(value);
    }
  };

  const handleAdvanced = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setShowSettings(true);
  };

  useEffect(() => {
    if (cardData && cardData.length > 0) {
      const randomIndex = Math.floor(Math.random() * cardData.length);
      const artCropUrl = cardData[randomIndex].card.front.imgs.art_crop;
      setBackgroundImage(artCropUrl);
    }
  }, [cardData]);

  useEffect(() => {
    if (rangeOfQuiz > 0) {
      const validSelected = Array.from(context.excludedRanks).filter(
        (rank) => rank <= rangeOfQuiz
      ).length;
      const availableCards = rangeOfQuiz - validSelected;
      setEnoughCards(availableCards >= 10);
    } else {
      setEnoughCards(false);
    }
  }, [rangeOfQuiz, context.excludedRanks]);

  const handlePatchNotes = () => {
    setSettingsWindow('notes');
    setShowSettings(true);
  };

  return (
    <>
      <main className='page-container'>
        {backgroundImage && (
          <>
            <div
              className='background-img'
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            <div className='background-overlay' />
          </>
        )}
        <div className='start-screen'>
          <div className='start-center'>
            <div className='home-content'>
              <img
                src={SaltLogo}
                alt='salt logo'
                className='salt-logo orange-glow'
              />
              <h1 className='home-title'>Welcome to the Salt Quiz!</h1>
              <p className='home-text'>
                SaltQuiz was inspired by the Magic: The Gathering (MTG) creator
                CovertGoBlue and his series{' '}
                <a
                  className='home-text-link'
                  href='https://youtube.com/playlist?list=PLKclisNxc8D86pLyZK8Ze87ThhbZKQWGA&si=8z_PwLxwj4hH6Ltj'
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  CovertGoSalt
                </a>
                . Now featured in the latest episode!
              </p>
              {gameMode === 'salt' ? (
                <>
                  <p className='home-text'>
                    SaltQuiz features MTG cards from the 2024{' '}
                    <a
                      className='home-text-link'
                      href='https://edhrec.com/top/salt'
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      Top 100 Saltiest Cards
                    </a>{' '}
                    list published by EDHREC. Out of X cards, where X is your
                    selected quiz range, you will be shown a selection at
                    random. For each card, you must guess its rank between 1 and
                    X. Your score for each card is the absolute difference
                    between your guess and the card's rank. A lower score
                    indicates greater accuracy.
                  </p>
                  <p className='home-text'>Select a value for X to begin:</p>
                </>
              ) : (
                <>
                  <p className='home-text'>
                    The Salt Shift quiz features MTG cards from the 2024{' '}
                    <a
                      className='home-text-link'
                      href='https://edhrec.com/top/salt'
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      Top 100 Saltiest Cards
                    </a>{' '}
                    list published by EDHREC. This mode identifies cards that
                    appear across multiple years of Salt Lists and selects X of
                    them at random, where X is your quiz length. For each card,
                    you'll see its previous year's rank and must guess whether
                    its position increased or decreased in the current year's
                    list. A smaller number indicates a greater ranking.
                  </p>
                </>
              )}
              <div className='button-gap' />
              {creatorQuiz || gameMode === 'shift' ? (
                <div className='home-x-container'>
                  <Tooltip
                    title={
                      <>
                        <p className='tooltip-text'>Disabled under</p>
                        <p className='tooltip-text'>current settings</p>
                      </>
                    }
                    enterDelay={400}
                    placement='top'
                  >
                    <div className='home-x-container-disabled'>
                      <div className='x-container-disabled unselected'>
                        <p className='x-value'>25</p>
                      </div>
                      <div className='x-container-disabled unselected'>
                        <p className='x-value'>50</p>
                      </div>
                      <div className='x-container-disabled unselected'>
                        <p className='x-value'>75</p>
                      </div>
                      <div className='x-container-disabled selected blue-glow'>
                        <p className='x-value'>100</p>
                      </div>
                    </div>
                  </Tooltip>
                  <div
                    className='gear-container'
                    onClick={(e) => handleAdvanced(e)}
                  >
                    <p className='gear-value'>
                      <GearIcon className='gear-icon' />
                    </p>
                  </div>
                </div>
              ) : (
                <div className='home-x-container'>
                  <div
                    className={`x-container ${
                      rangeOfQuiz === 0
                        ? ''
                        : rangeOfQuiz === 25
                        ? 'selected blue-glow'
                        : 'unselected'
                    }`}
                    onClick={() => handleCardNumber(25)}
                  >
                    <p className='x-value'>25</p>
                  </div>
                  <div
                    className={`x-container ${
                      rangeOfQuiz === 0
                        ? ''
                        : rangeOfQuiz === 50
                        ? 'selected blue-glow'
                        : 'unselected'
                    }`}
                    onClick={() => handleCardNumber(50)}
                  >
                    <p className='x-value'>50</p>
                  </div>
                  <div
                    className={`x-container ${
                      rangeOfQuiz === 0
                        ? ''
                        : rangeOfQuiz === 75
                        ? 'selected blue-glow'
                        : 'unselected'
                    }`}
                    onClick={() => handleCardNumber(75)}
                  >
                    <p className='x-value'>75</p>
                  </div>
                  <div
                    className={`x-container ${
                      rangeOfQuiz === 0
                        ? ''
                        : rangeOfQuiz === 100
                        ? 'selected blue-glow'
                        : 'unselected'
                    }`}
                    onClick={() => handleCardNumber(100)}
                  >
                    <p className='x-value'>100</p>
                  </div>
                  <div
                    className='gear-container'
                    onClick={(e) => handleAdvanced(e)}
                  >
                    <p className='gear-value'>
                      <GearIcon className='gear-icon' />
                    </p>
                  </div>
                </div>
              )}
              <div className='home-button-container'>
                {rangeOfQuiz === 0 || !enoughCards ? (
                  <Tooltip
                    title={
                      <>
                        <p className='tooltip-text'>
                          Must select an option for X and
                        </p>
                        <p className='tooltip-text'>
                          Must have at least 10 cards for quiz
                        </p>
                      </>
                    }
                    enterDelay={600}
                    leaveDelay={200}
                    placement='top'
                  >
                    <div className='inactive-button'>Start Quiz</div>
                  </Tooltip>
                ) : (
                  <Link
                    to={gameMode === 'salt' ? '/salt' : '/shift'}
                    className='guess-button orange-glow'
                    onClick={() => handleStart()}
                  >
                    {gameMode === 'salt' ? 'Start Quiz' : 'Start Salt Shift'}
                  </Link>
                )}
              </div>
              <p className='home-patch-notes-link-container'>
                <p className='home-patch-notes-link-text'>View</p>
                <p
                  className='home-patch-notes-link'
                  onClick={() => handlePatchNotes()}
                >
                  Patch Notes
                </p>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
