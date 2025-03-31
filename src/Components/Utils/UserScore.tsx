import React, { useContext, useState } from 'react';
import { AppContext } from 'Contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import HomeIcon from 'Svgs/HomeIcon';
import BackArrow from 'Svgs/BackArrow';
import ExpandIcon from 'Svgs/ExpandIcon';
import Tooltip from '@mui/material/Tooltip';
import 'Styles/Utils/UserScore.css';

interface UserScoreProps {
  allGuessedForCurrentRound: boolean;
}

const UserScore: React.FC<UserScoreProps> = ({ allGuessedForCurrentRound }) => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {
    players,
    setPlayers,
    setCurrentCardGuesses,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    setCurrentIndex,
    setRevealedRanks,
    setFinished,
  } = context;

  const [confirm, setConfirm] = useState(false);
  const [expand, setExpand] = useState(false);

  const navigate = useNavigate();

  const calculateTotalScore = (playerScores: Array<{ diff: number }>) => {
    return playerScores.reduce((acc, curr) => acc + curr.diff, 0);
  };

  const handleConfirm = () => {
    setConfirm(true);

    setTimeout(() => {
      setConfirm(false);
    }, 3000);
  };

  const handleHome = () => {
    setCurrentIndex(0);
    setCurrentCardGuesses({});
    setRevealedRanks([]);
    setFinished(false);
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        scores: [],
      }))
    );
    setCurrentPlayerIndex(0);
    navigate('/');
  };

  const handleExpand = () => {
    setExpand(!expand);
  };

  return (
    <div className='user-score-container'>
      {players.length === 1 ? (
        <div className='user-score-score-container'>
          <span className='score-label'>Score:</span>
          <span className='score-value'>
            {calculateTotalScore(players[0].scores)}
          </span>
        </div>
      ) : (
        <>
          <div className='expand-container'>
            {expand ? (
              <ExpandIcon
                className='expand-icon'
                onClick={() => handleExpand()}
              />
            ) : (
              <ExpandIcon
                className='expand-icon-left'
                onClick={() => handleExpand()}
              />
            )}
          </div>
          {expand ? (
            <div className='multi-player-scores'>
              {players.map((player, index) => {
                let playerClass = '';
                if (allGuessedForCurrentRound) {
                  playerClass = 'guessed';
                } else {
                  if (index < currentPlayerIndex) {
                    playerClass = 'guessed';
                  } else if (index === currentPlayerIndex) {
                    playerClass = 'current-player';
                  }
                }
                return (
                  <div
                    key={player.order}
                    className={`player-score ${playerClass}`}
                  >
                    <span className='player-name'>
                      {player.name.trim() || `Player ${index + 1}`}
                    </span>
                    <span className='player-total'>
                      {calculateTotalScore(player.scores)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='single-player-score-container'>
              <div
                key={players[currentPlayerIndex].order}
                className='player-score single'
              >
                <span className='player-name'>
                  {players[currentPlayerIndex].name.trim() ||
                    `Player ${currentPlayerIndex + 1}`}
                </span>
                <span className='player-total'>
                  {calculateTotalScore(players[currentPlayerIndex].scores)}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <div className='user-score-home-container'>
        <div className='home-icons'>
          {confirm ? (
            <Tooltip
              title={<p className='tooltip-text'>Confirm</p>}
              enterDelay={600}
              leaveDelay={200}
              placement='bottom'
            >
              <BackArrow className='back-arrow-icon' onClick={handleHome} />
            </Tooltip>
          ) : (
            <Tooltip
              title={<p className='tooltip-text'>Home</p>}
              enterDelay={600}
              leaveDelay={100}
              placement='bottom'
            >
              <HomeIcon className='home-icon' onClick={handleConfirm} />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserScore;
