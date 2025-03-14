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
    numberOfCards,
    setNumberOfCards,
    setUserGuess,
    setScores,
    setRevealedRanks,
    setStarted,
    setCanScroll,
  } = context;

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const handleStart = () => {
    setStarted(false);
    setCurrentIndex(0);
    setUserGuess(0);
    setScores([]);
    setRevealedRanks([]);
    setCanScroll(true);
  };

  const handleCardNumber = (value: number) => {
    if (numberOfCards === value) {
      setNumberOfCards(0);
    } else {
      setNumberOfCards(value);
    }
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
              , where he quizzes other creators on the 100 saltiest cards. His
              series inspired the creation of this web app so that anyone can
              try it out for themselves.
            </p>
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
              list published by EDHREC. Out of X cards you will be shown 10 at
              random, where X is your selected quiz range. For each card, you
              must guess its rank between 1 and X. Your score for each card is
              the absolute difference between your guess and the card's rank. A
              lower score indicates greater accuracy.
            </p>
            <p className='home-text'>Select a value for X to begin:</p>
            <div className='button-gap' />
            <div className='home-x-container'>
              <div
                className={`x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 25
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(25)}
              >
                <p className='x-value'>25</p>
              </div>
              <div
                className={`x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 50
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(50)}
              >
                <p className='x-value'>50</p>
              </div>
              <div
                className={`x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 75
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(75)}
              >
                <p className='x-value'>75</p>
              </div>
              <div
                className={`x-container ${
                  numberOfCards === 0
                    ? ''
                    : numberOfCards === 100
                    ? 'selected blue-glow'
                    : 'unselected'
                }`}
                onClick={() => handleCardNumber(100)}
              >
                <p className='x-value'>100</p>
              </div>
            </div>
            {numberOfCards === 0 ? (
              <div className='inactive-button'>Start Quiz</div>
            ) : (
              <Link
                to='/salt'
                className='guess-button orange-glow'
                onClick={() => handleStart()}
              >
                Start Quiz
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
