import React, { useContext } from 'react';
import { AppContext } from 'Contexts/AppContext';
import 'Styles/Utils/UserScore.css';

const UserScore: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const { scores } = context;

  const totalScore = scores.reduce((acc, curr) => acc + curr.diff, 0);

  return (
    <div className='user-score-container'>
      <span className='score-label'>Score:</span>
      <span className='score-value'>{totalScore}</span>
    </div>
  );
};

export default UserScore;
