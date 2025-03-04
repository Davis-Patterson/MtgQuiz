import React, { useContext, useState } from 'react';
import { AppContext } from 'Contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import HomeIcon from 'Svgs/HomeIcon';
import 'Styles/Utils/UserScore.css';
import BackArrow from 'Svgs/BackArrow';

const UserScore: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {
    scores,
    setScores,
    setCurrentIndex,
    setUserGuess,
    setRevealedRanks,
    setFinished,
  } = context;

  const [confirm, setConfirm] = useState(false);

  const navigate = useNavigate();

  const totalScore = scores.reduce((acc, curr) => acc + curr.diff, 0);

  const handleConfirm = () => {
    setConfirm(true);

    setTimeout(() => {
      setConfirm(false);
    }, 3000);
  };

  const handleHome = () => {
    setCurrentIndex(0);
    setUserGuess(0);
    setScores([]);
    setRevealedRanks([]);
    setFinished(false);
    navigate('/');
  };

  return (
    <div className='user-score-container'>
      <div className='user-score-score-container'>
        <span className='score-label'>Score:</span>
        <span className='score-value'>{totalScore}</span>
      </div>
      <div className='user-score-home-container'>
        <div className='home-icons'>
          {confirm ? (
            <BackArrow
              className='back-arrow-icon'
              onClick={() => handleHome()}
            />
          ) : (
            <HomeIcon className='home-icon' onClick={() => handleConfirm()} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserScore;
