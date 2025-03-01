import React, { useContext } from 'react';
import { AppContext } from 'Contexts/AppContext';
import { Link } from 'react-router-dom';
import SaltLogo from 'Assets/Images/salt-logo.webp';
import 'Styles/Main/Home.css';

const Home: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {
    setCurrentIndex,
    setUserGuess,
    setScores,
    setRevealedRanks,
    setStarted,
  } = context;

  const handleStart = () => {
    setStarted(false);
    setCurrentIndex(0);
    setUserGuess(0);
    setScores([]);
    setRevealedRanks([]);
  };

  return (
    <>
      <main className='page-container'>
        <div className='start-screen'>
          <img src={SaltLogo} alt='salt logo' className='salt-logo' />
          <h1 className='home-title'>Welcome to the Salt Quiz!</h1>
          <p className='home-text'>
            In this game, you'll be shown 10 random Magic: The Gathering cards
            from the top 100 saltiest cards according to{' '}
            <a
              className='home-text-link'
              href='https://edhrec.com/top/salt'
              rel='noopener noreferrer'
              target='_blank'
            >
              EDHREC
            </a>
            .
          </p>
          <p className='home-text'>
            For each card, you must guess its ranking between 1 and 100. Your
            score for each card is the absolute difference between your guess
            and the card's actual rank. The lower the score, the better.
          </p>
          <p className='home-text'>Try to get as close as possible!</p>
          <div className='button-gap' />
          <Link
            to='/salt'
            className='guess-button'
            onClick={() => handleStart()}
          >
            Start Game
          </Link>
        </div>
      </main>
    </>
  );
};

export default Home;
