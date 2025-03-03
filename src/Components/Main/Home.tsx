import React, { useContext, useState, useEffect } from 'react';
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
    cardData,
    setCurrentIndex,
    setUserGuess,
    setScores,
    setRevealedRanks,
    setStarted,
  } = context;

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const handleStart = () => {
    setStarted(false);
    setCurrentIndex(0);
    setUserGuess(0);
    setScores([]);
    setRevealedRanks([]);
  };

  useEffect(() => {
    if (cardData && cardData.length > 0) {
      const randomIndex = Math.floor(Math.random() * cardData.length);
      const artCropUrl = cardData[randomIndex].card.front.imgs.art_crop;
      setBackgroundImage(artCropUrl);
    }
  }, [cardData]);

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
          <div className='home-content'>
            <img
              src={SaltLogo}
              alt='salt logo'
              className='salt-logo orange-glow'
            />
            <h1 className='home-title'>Welcome to the Salt Quiz!</h1>
            <p className='home-text'>
              In this game, you'll be shown 10 random Magic: The Gathering cards
              from the 2024 community-generated "Top 100 Saltiest Cards" list
              from{' '}
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
              and the card's actual rank.
            </p>
            <p className='home-text'>The lower the score, the better.</p>
            <div className='button-gap' />
            <Link
              to='/salt'
              className='guess-button orange-glow'
              onClick={() => handleStart()}
            >
              Start Game
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
