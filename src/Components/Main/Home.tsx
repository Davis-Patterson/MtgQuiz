import React, { useContext, useState, useEffect } from 'react';
import { AppContext, WindowType } from 'Contexts/AppContext';
import { Link } from 'react-router-dom';
import SaltLogo from 'Assets/Images/salt-logo.webp';
import NotesIcon from 'Svgs/NotesIcon';
import TrophyIcon from 'Svgs/TrophyIcon';
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

  const handlePatchNotes = (window: WindowType) => {
    setSettingsWindow(window);
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
                . Now featured in the latest episodes!
              </p>
              {gameMode === 'salt' ? (
                <>
                  <p className='home-text'>
                    SaltQuiz features MTG cards from the 2025{' '}
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
                </>
              ) : (
                <>
                  <p className='home-text'>
                    The Salt Shift quiz features MTG cards from the 2025{' '}
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
              <div className='home-button-container'>
                <div className='home-bottom-links-container'>
                  <Tooltip
                    title={
                      <>
                        <div className='tooltip-text-container'>
                          <p className='tooltip-text'>Patch Notes</p>
                        </div>
                      </>
                    }
                    enterDelay={600}
                    leaveDelay={200}
                    placement='top'
                  >
                    <div
                      className='home-settings-link-container dark-blue-glow'
                      onClick={() => handlePatchNotes('notes')}
                    >
                      <div className='home-patch-notes-link'>
                        <NotesIcon className='home-notes-icon' />
                      </div>
                    </div>
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
                    leaveDelay={200}
                    placement='top'
                  >
                    <div
                      className='home-settings-link-container dark-blue-glow'
                      onClick={() => handlePatchNotes('leaderboard')}
                    >
                      <p className='home-patch-notes-link'>
                        <TrophyIcon className='home-trophy-icon' />
                      </p>
                    </div>
                  </Tooltip>
                  <Tooltip
                    title={
                      <>
                        <div className='tooltip-text-container'>
                          <p className='tooltip-text'>Settings</p>
                        </div>
                      </>
                    }
                    enterDelay={600}
                    leaveDelay={200}
                    placement='top'
                  >
                    <div
                      className='home-settings-link-container dark-blue-glow'
                      onClick={() => handlePatchNotes('settings')}
                    >
                      <p className='home-patch-notes-link'>
                        <GearIcon className='home-gear-icon' />
                      </p>
                    </div>
                  </Tooltip>
                </div>
                {rangeOfQuiz === 0 || !enoughCards ? (
                  <Tooltip
                    title={
                      <>
                        <div className='tooltip-text-container'>
                          <p className='tooltip-text'>
                            Must select an option for X and
                          </p>
                          <p className='tooltip-text'>
                            Must have at least 10 cards for quiz
                          </p>
                        </div>
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
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
